"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGossipVoluntaryExit = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const network_1 = require("../../network");
const errors_1 = require("../errors");
async function validateGossipVoluntaryExit(chain, voluntaryExit) {
    // [IGNORE] The voluntary exit is the first valid voluntary exit received for the validator with index
    // signed_voluntary_exit.message.validator_index.
    if (chain.opPool.hasSeenVoluntaryExit(voluntaryExit.message.validatorIndex)) {
        throw new errors_1.VoluntaryExitError(errors_1.GossipAction.IGNORE, null, {
            code: errors_1.VoluntaryExitErrorCode.ALREADY_EXISTS,
        });
    }
    // What state should the voluntaryExit validate against?
    //
    // The only condtion that is time sensitive and may require a non-head state is
    // -> Validator is active && validator has not initiated exit
    // The voluntaryExit.epoch must be in the past but the validator's status may change in recent epochs.
    // We dial the head state to the current epoch to get the current status of the validator. This is
    // relevant on periods of many skipped slots.
    const state = await chain.getHeadStateAtCurrentEpoch();
    // [REJECT] All of the conditions within process_voluntary_exit pass validation.
    // verifySignature = false, verified in batch below
    // These errors occur due to a fault in the beacon chain. It is not necessarily
    // the fault on the peer.
    if (!lodestar_beacon_state_transition_1.allForks.isValidVoluntaryExit(state, voluntaryExit, false)) {
        throw new errors_1.VoluntaryExitError(errors_1.GossipAction.REJECT, network_1.PeerAction.HighToleranceError, {
            code: errors_1.VoluntaryExitErrorCode.INVALID,
        });
    }
    const signatureSet = lodestar_beacon_state_transition_1.allForks.getVoluntaryExitSignatureSet(state, voluntaryExit);
    if (!(await chain.bls.verifySignatureSets([signatureSet], { batchable: true }))) {
        throw new errors_1.VoluntaryExitError(errors_1.GossipAction.REJECT, network_1.PeerAction.HighToleranceError, {
            code: errors_1.VoluntaryExitErrorCode.INVALID_SIGNATURE,
        });
    }
}
exports.validateGossipVoluntaryExit = validateGossipVoluntaryExit;
//# sourceMappingURL=voluntaryExit.js.map