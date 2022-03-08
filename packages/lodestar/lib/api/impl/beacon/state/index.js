"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBeaconStateApi = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const errors_1 = require("../../errors");
const utils_1 = require("./utils");
function getBeaconStateApi({ chain, config, db }) {
    async function getState(stateId) {
        return await (0, utils_1.resolveStateId)(config, chain, db, stateId);
    }
    return {
        async getStateRoot(stateId) {
            const state = await getState(stateId);
            return { data: config.getForkTypes(state.slot).BeaconState.hashTreeRoot(state) };
        },
        async getStateFork(stateId) {
            const state = await getState(stateId);
            return { data: state.fork };
        },
        async getStateFinalityCheckpoints(stateId) {
            const state = await getState(stateId);
            return {
                data: {
                    currentJustified: state.currentJustifiedCheckpoint,
                    previousJustified: state.previousJustifiedCheckpoint,
                    finalized: state.finalizedCheckpoint,
                },
            };
        },
        async getStateValidators(stateId, filters) {
            const state = await (0, utils_1.resolveStateId)(config, chain, db, stateId);
            const currentEpoch = (0, lodestar_beacon_state_transition_1.getCurrentEpoch)(state);
            const { validators, balances } = state; // Get the validators sub tree once for all the loop
            const { pubkey2index } = chain.getHeadState();
            const validatorResponses = [];
            if (filters === null || filters === void 0 ? void 0 : filters.indices) {
                for (const id of filters.indices) {
                    const validatorIndex = (0, utils_1.getStateValidatorIndex)(id, state, pubkey2index);
                    if (validatorIndex != null) {
                        const validator = validators[validatorIndex];
                        if (filters.statuses && !filters.statuses.includes((0, utils_1.getValidatorStatus)(validator, currentEpoch))) {
                            continue;
                        }
                        const validatorResponse = (0, utils_1.toValidatorResponse)(validatorIndex, validator, balances[validatorIndex], currentEpoch);
                        validatorResponses.push(validatorResponse);
                    }
                }
                return { data: validatorResponses };
            }
            else if (filters === null || filters === void 0 ? void 0 : filters.statuses) {
                const validatorsByStatus = (0, utils_1.filterStateValidatorsByStatuses)(filters.statuses, state, pubkey2index, currentEpoch);
                return { data: validatorsByStatus };
            }
            let index = 0;
            const resp = [];
            for (const v of (0, ssz_1.readonlyValues)(state.validators)) {
                resp.push((0, utils_1.toValidatorResponse)(index, v, balances[index], currentEpoch));
                index++;
            }
            return { data: resp };
        },
        async getStateValidator(stateId, validatorId) {
            const state = await (0, utils_1.resolveStateId)(config, chain, db, stateId);
            const { pubkey2index } = chain.getHeadState();
            const validatorIndex = (0, utils_1.getStateValidatorIndex)(validatorId, state, pubkey2index);
            if (validatorIndex == null) {
                throw new errors_1.ApiError(404, "Validator not found");
            }
            return {
                data: (0, utils_1.toValidatorResponse)(validatorIndex, state.validators[validatorIndex], state.balances[validatorIndex], (0, lodestar_beacon_state_transition_1.getCurrentEpoch)(state)),
            };
        },
        async getStateValidatorBalances(stateId, indices) {
            const state = await (0, utils_1.resolveStateId)(config, chain, db, stateId);
            if (indices) {
                const headState = chain.getHeadState();
                const balances = [];
                for (const id of indices) {
                    if (typeof id === "number") {
                        if (state.validators.length <= id) {
                            continue;
                        }
                        balances.push({ index: id, balance: state.balances[id] });
                    }
                    else {
                        const index = headState.pubkey2index.get(id);
                        if (index != null && index <= state.validators.length) {
                            balances.push({ index, balance: state.balances[index] });
                        }
                    }
                }
                return { data: balances };
            }
            const balances = Array.from((0, ssz_1.readonlyValues)(state.balances), (balance, index) => {
                return {
                    index,
                    balance,
                };
            });
            return { data: balances };
        },
        async getEpochCommittees(stateId, filters) {
            var _a;
            const state = await (0, utils_1.resolveStateId)(config, chain, db, stateId);
            const stateCached = state;
            if (stateCached.epochCtx === undefined) {
                throw new errors_1.ApiError(400, `No cached state available for stateId: ${stateId}`);
            }
            const shuffling = stateCached.epochCtx.getShufflingAtEpoch((_a = filters === null || filters === void 0 ? void 0 : filters.epoch) !== null && _a !== void 0 ? _a : (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(state.slot));
            const committes = shuffling.committees;
            const committesFlat = committes.flatMap((slotCommittees, committeeIndex) => {
                if ((filters === null || filters === void 0 ? void 0 : filters.index) !== undefined && filters.index !== committeeIndex) {
                    return [];
                }
                return slotCommittees.flatMap((committee, slot) => {
                    if ((filters === null || filters === void 0 ? void 0 : filters.slot) !== undefined && filters.slot !== slot) {
                        return [];
                    }
                    return [
                        {
                            index: committeeIndex,
                            slot,
                            validators: committee,
                        },
                    ];
                });
            });
            return { data: committesFlat };
        },
        /**
         * Retrieves the sync committees for the given state.
         * @param epoch Fetch sync committees for the given epoch. If not present then the sync committees for the epoch of the state will be obtained.
         */
        async getEpochSyncCommittees(stateId, epoch) {
            // TODO: Should pick a state with the provided epoch too
            const state = (await (0, utils_1.resolveStateId)(config, chain, db, stateId));
            // TODO: If possible compute the syncCommittees in advance of the fork and expose them here.
            // So the validators can prepare and potentially attest the first block. Not critical tho, it's very unlikely
            const stateEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(state.slot);
            if (stateEpoch < config.ALTAIR_FORK_EPOCH) {
                throw new errors_1.ApiError(400, "Requested state before ALTAIR_FORK_EPOCH");
            }
            const stateCached = state;
            if (stateCached.epochCtx === undefined) {
                throw new errors_1.ApiError(400, `No cached state available for stateId: ${stateId}`);
            }
            const syncCommitteeCache = stateCached.epochCtx.getIndexedSyncCommitteeAtEpoch(epoch !== null && epoch !== void 0 ? epoch : stateEpoch);
            return {
                data: {
                    validators: syncCommitteeCache.validatorIndices,
                    // TODO: This is not used by the validator and will be deprecated soon
                    validatorAggregates: [],
                },
            };
        },
    };
}
exports.getBeaconStateApi = getBeaconStateApi;
//# sourceMappingURL=index.js.map