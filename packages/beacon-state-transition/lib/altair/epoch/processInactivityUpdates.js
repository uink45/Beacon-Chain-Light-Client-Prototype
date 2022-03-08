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
exports.processInactivityUpdates = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const attesterStatusUtil = __importStar(require("../../util/attesterStatus"));
const util_1 = require("../../util");
/**
 * Mutates `inactivityScores` from pre-calculated validator statuses.
 *
 * PERF: Cost = iterate over an array of size $VALIDATOR_COUNT + 'proportional' to how many validtors are inactive or
 * have been inactive in the past, i.e. that require an update to their inactivityScore. Worst case = all validators
 * need to update their non-zero `inactivityScore`.
 *
 * - On normal mainnet conditions
 *   - prevTargetAttester: 96%
 *   - unslashed:          100%
 *   - eligibleAttester:   98%
 *
 * TODO: Compute from altair testnet inactivityScores updates on average
 */
function processInactivityUpdates(state, epochProcess) {
    if (state.currentShuffling.epoch === lodestar_params_1.GENESIS_EPOCH) {
        return;
    }
    const { config, inactivityScores } = state;
    const { INACTIVITY_SCORE_BIAS, INACTIVITY_SCORE_RECOVERY_RATE } = config;
    const { statuses } = epochProcess;
    const inActivityLeak = (0, util_1.isInInactivityLeak)(state);
    // this avoids importing FLAG_ELIGIBLE_ATTESTER inside the for loop, check the compiled code
    const { FLAG_ELIGIBLE_ATTESTER, FLAG_PREV_TARGET_ATTESTER_OR_UNSLASHED, hasMarkers } = attesterStatusUtil;
    const newValues = new Map();
    inactivityScores.forEach(function processInactivityScore(inactivityScore, i) {
        const status = statuses[i];
        if (hasMarkers(status.flags, FLAG_ELIGIBLE_ATTESTER)) {
            const prevInactivityScore = inactivityScore;
            if (hasMarkers(status.flags, FLAG_PREV_TARGET_ATTESTER_OR_UNSLASHED)) {
                inactivityScore -= Math.min(1, inactivityScore);
            }
            else {
                inactivityScore += Number(INACTIVITY_SCORE_BIAS);
            }
            if (!inActivityLeak) {
                inactivityScore -= Math.min(Number(INACTIVITY_SCORE_RECOVERY_RATE), inactivityScore);
            }
            if (inactivityScore !== prevInactivityScore) {
                newValues.set(i, inactivityScore);
            }
        }
    });
    inactivityScores.setMultiple(newValues);
}
exports.processInactivityUpdates = processInactivityUpdates;
//# sourceMappingURL=processInactivityUpdates.js.map