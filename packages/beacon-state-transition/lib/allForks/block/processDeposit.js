"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDeposit = void 0;
const bls_1 = __importStar(require("@chainsafe/bls"));
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const constants_1 = require("../../constants");
const util_1 = require("../../util");
/**
 * Process a Deposit operation. Potentially adds a new validator to the registry. Mutates the validators and balances
 * trees, pushing contigious values at the end.
 *
 * PERF: Work depends on number of Deposit per block. On regular networks the average is 0 / block.
 */
function processDeposit(fork, state, deposit) {
    const { config, validators, epochCtx } = state;
    // verify the merkle branch
    if (!(0, lodestar_utils_1.verifyMerkleBranch)(lodestar_types_1.ssz.phase0.DepositData.hashTreeRoot(deposit.data), Array.from(deposit.proof).map((p) => p.valueOf()), lodestar_params_1.DEPOSIT_CONTRACT_TREE_DEPTH + 1, state.eth1DepositIndex, state.eth1Data.depositRoot.valueOf())) {
        throw new Error("Deposit has invalid merkle proof");
    }
    // deposits must be processed in order
    state.eth1DepositIndex += 1;
    const pubkey = deposit.data.pubkey.valueOf(); // Drop tree
    const amount = deposit.data.amount;
    const cachedIndex = epochCtx.pubkey2index.get(pubkey);
    if (cachedIndex === undefined || !Number.isSafeInteger(cachedIndex) || cachedIndex >= validators.length) {
        // verify the deposit signature (proof of posession) which is not checked by the deposit contract
        const depositMessage = {
            pubkey: deposit.data.pubkey,
            withdrawalCredentials: deposit.data.withdrawalCredentials,
            amount: deposit.data.amount,
        };
        // fork-agnostic domain since deposits are valid across forks
        const domain = (0, util_1.computeDomain)(lodestar_params_1.DOMAIN_DEPOSIT, config.GENESIS_FORK_VERSION, constants_1.ZERO_HASH);
        const signingRoot = (0, util_1.computeSigningRoot)(lodestar_types_1.ssz.phase0.DepositMessage, depositMessage, domain);
        try {
            // Pubkeys must be checked for group + inf. This must be done only once when the validator deposit is processed
            const publicKey = bls_1.default.PublicKey.fromBytes(pubkey, bls_1.CoordType.affine, true);
            const signature = bls_1.default.Signature.fromBytes(deposit.data.signature.valueOf(), bls_1.CoordType.affine, true);
            if (!signature.verify(publicKey, signingRoot)) {
                return;
            }
        }
        catch (e) {
            return; // Catch all BLS errors: failed key validation, failed signature validation, invalid signature
        }
        // add validator and balance entries
        const effectiveBalance = Math.min(amount - (amount % lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT), lodestar_params_1.MAX_EFFECTIVE_BALANCE);
        validators.push({
            pubkey,
            withdrawalCredentials: deposit.data.withdrawalCredentials.valueOf(),
            activationEligibilityEpoch: lodestar_params_1.FAR_FUTURE_EPOCH,
            activationEpoch: lodestar_params_1.FAR_FUTURE_EPOCH,
            exitEpoch: lodestar_params_1.FAR_FUTURE_EPOCH,
            withdrawableEpoch: lodestar_params_1.FAR_FUTURE_EPOCH,
            effectiveBalance,
            slashed: false,
        });
        state.balanceList.push(Number(amount));
        const validatorIndex = validators.length - 1;
        // Updating here is better than updating at once on epoch transition
        // - Simplify genesis fn applyDeposits(): effectiveBalanceIncrements is populated immediately
        // - Keep related code together to reduce risk of breaking this cache
        // - Should have equal performance since it sets a value in a flat array
        epochCtx.effectiveBalanceIncrementsSet(validatorIndex, effectiveBalance);
        // now that there is a new validator, update the epoch context with the new pubkey
        epochCtx.addPubkey(validatorIndex, pubkey);
        // add participation caches
        state.previousEpochParticipation.push(0);
        state.currentEpochParticipation.push(0);
        // Forks: altair, bellatrix, and future
        if (fork !== lodestar_params_1.ForkName.phase0) {
            state.inactivityScores.push(0);
        }
    }
    else {
        // increase balance by deposit amount
        (0, util_1.increaseBalance)(state, cachedIndex, Number(amount));
    }
}
exports.processDeposit = processDeposit;
//# sourceMappingURL=processDeposit.js.map