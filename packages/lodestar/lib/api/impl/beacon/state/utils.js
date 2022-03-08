"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateValidatorIndex = exports.filterStateValidatorsByStatuses = exports.toValidatorResponse = exports.getValidatorStatus = exports.resolveStateId = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
// this will need async once we wan't to resolve archive slot
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_beacon_state_transition_2 = require("@chainsafe/lodestar-beacon-state-transition");
const ssz_1 = require("@chainsafe/ssz");
const errors_1 = require("../../errors");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
async function resolveStateId(config, chain, db, stateId, opts) {
    const state = await resolveStateIdOrNull(config, chain, db, stateId, opts);
    if (!state) {
        throw new errors_1.ApiError(404, `No state found for id '${stateId}'`);
    }
    return state;
}
exports.resolveStateId = resolveStateId;
async function resolveStateIdOrNull(config, chain, db, stateId, opts) {
    stateId = stateId.toLowerCase();
    if (stateId === "head" || stateId === "genesis" || stateId === "finalized" || stateId === "justified") {
        return await stateByName(db, chain.stateCache, chain.forkChoice, stateId);
    }
    if (stateId.startsWith("0x")) {
        return await stateByRoot(db, chain.stateCache, stateId);
    }
    // state id must be slot
    const slot = parseInt(stateId, 10);
    if (isNaN(slot) && isNaN(slot - 0)) {
        throw new errors_1.ValidationError(`Invalid state id '${stateId}'`, "stateId");
    }
    return await stateBySlot(config, db, chain.stateCache, chain.forkChoice, slot, opts);
}
/**
 * Get the status of the validator
 * based on conditions outlined in https://hackmd.io/ofFJ5gOmQpu1jjHilHbdQQ
 */
function getValidatorStatus(validator, currentEpoch) {
    // pending
    if (validator.activationEpoch > currentEpoch) {
        if (validator.activationEligibilityEpoch === lodestar_params_1.FAR_FUTURE_EPOCH) {
            return "pending_initialized";
        }
        else if (validator.activationEligibilityEpoch < lodestar_params_1.FAR_FUTURE_EPOCH) {
            return "pending_queued";
        }
    }
    // active
    if (validator.activationEpoch <= currentEpoch && currentEpoch < validator.exitEpoch) {
        if (validator.exitEpoch === lodestar_params_1.FAR_FUTURE_EPOCH) {
            return "active_ongoing";
        }
        else if (validator.exitEpoch < lodestar_params_1.FAR_FUTURE_EPOCH) {
            return validator.slashed ? "active_slashed" : "active_exiting";
        }
    }
    // exited
    if (validator.exitEpoch <= currentEpoch && currentEpoch < validator.withdrawableEpoch) {
        return validator.slashed ? "exited_slashed" : "exited_unslashed";
    }
    // withdrawal
    if (validator.withdrawableEpoch <= currentEpoch) {
        return validator.effectiveBalance !== 0 ? "withdrawal_possible" : "withdrawal_done";
    }
    throw new Error("ValidatorStatus unknown");
}
exports.getValidatorStatus = getValidatorStatus;
function toValidatorResponse(index, validator, balance, currentEpoch) {
    return {
        index,
        status: getValidatorStatus(validator, currentEpoch),
        balance,
        validator,
    };
}
exports.toValidatorResponse = toValidatorResponse;
async function stateByName(db, stateCache, forkChoice, stateId) {
    var _a, _b, _c;
    switch (stateId) {
        case "head":
            return (_a = stateCache.get(forkChoice.getHead().stateRoot)) !== null && _a !== void 0 ? _a : null;
        case "genesis":
            return await db.stateArchive.get(lodestar_params_1.GENESIS_SLOT);
        case "finalized":
            return (_b = stateCache.get(forkChoice.getFinalizedBlock().stateRoot)) !== null && _b !== void 0 ? _b : null;
        case "justified":
            return (_c = stateCache.get(forkChoice.getJustifiedBlock().stateRoot)) !== null && _c !== void 0 ? _c : null;
        default:
            throw new Error("not a named state id");
    }
}
async function stateByRoot(db, stateCache, stateId) {
    if (stateId.startsWith("0x")) {
        const stateRoot = stateId;
        const cachedStateCtx = stateCache.get(stateRoot);
        if (cachedStateCtx)
            return cachedStateCtx;
        return await db.stateArchive.getByRoot((0, ssz_1.fromHexString)(stateRoot));
    }
    else {
        throw new Error("not a root state id");
    }
}
async function stateBySlot(config, db, stateCache, forkChoice, slot, opts) {
    const blockSummary = forkChoice.getCanonicalBlockAtSlot(slot);
    if (blockSummary) {
        const state = stateCache.get(blockSummary.stateRoot);
        if (state) {
            return state;
        }
    }
    if (opts === null || opts === void 0 ? void 0 : opts.regenFinalizedState) {
        return await getFinalizedState(config, db, forkChoice, slot);
    }
    return await db.stateArchive.get(slot);
}
function filterStateValidatorsByStatuses(statuses, state, pubkey2index, currentEpoch) {
    const responses = [];
    const validators = Array.from(state.validators);
    const filteredValidators = validators.filter((v) => statuses.includes(getValidatorStatus(v, currentEpoch)));
    for (const validator of (0, ssz_1.readonlyValues)(filteredValidators)) {
        const validatorIndex = getStateValidatorIndex(validator.pubkey, state, pubkey2index);
        if (validatorIndex !== undefined && (statuses === null || statuses === void 0 ? void 0 : statuses.includes(getValidatorStatus(validator, currentEpoch)))) {
            responses.push(toValidatorResponse(validatorIndex, validator, state.balances[validatorIndex], currentEpoch));
        }
    }
    return responses;
}
exports.filterStateValidatorsByStatuses = filterStateValidatorsByStatuses;
/**
 * Get the archived state nearest to `slot`.
 */
async function getNearestArchivedState(config, db, slot) {
    const states = db.stateArchive.valuesStream({ lte: slot, reverse: true });
    const state = (await states[Symbol.asyncIterator]().next()).value;
    return (0, lodestar_beacon_state_transition_1.createCachedBeaconState)(config, state);
}
async function getFinalizedState(config, db, forkChoice, slot) {
    lodestar_utils_1.assert.lte(slot, forkChoice.getFinalizedCheckpoint().epoch * lodestar_params_1.SLOTS_PER_EPOCH);
    let state = await getNearestArchivedState(config, db, slot);
    // process blocks up to the requested slot
    for await (const block of db.blockArchive.valuesStream({ gt: state.slot, lte: slot })) {
        state = lodestar_beacon_state_transition_2.allForks.stateTransition(state, block, {
            verifyStateRoot: false,
            verifyProposer: false,
            verifySignatures: false,
        });
        // yield to the event loop
        await (0, lodestar_utils_1.sleep)(0);
    }
    // due to skip slots, may need to process empty slots to reach the requested slot
    if (state.slot < slot) {
        state = lodestar_beacon_state_transition_2.allForks.processSlots(state, slot);
    }
    return state;
}
function getStateValidatorIndex(id, state, pubkey2index) {
    var _a;
    let validatorIndex;
    if (typeof id === "number") {
        if (state.validators.length > id) {
            validatorIndex = id;
        }
    }
    else {
        validatorIndex = (_a = pubkey2index.get(id)) !== null && _a !== void 0 ? _a : undefined;
        // validator added later than given stateId
        if (validatorIndex !== undefined && validatorIndex >= state.validators.length) {
            validatorIndex = undefined;
        }
    }
    return validatorIndex;
}
exports.getStateValidatorIndex = getStateValidatorIndex;
//# sourceMappingURL=utils.js.map