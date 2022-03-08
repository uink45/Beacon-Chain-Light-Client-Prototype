"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOperations = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const processProposerSlashing_1 = require("./processProposerSlashing");
const processAttesterSlashing_1 = require("./processAttesterSlashing");
const processAttestation_1 = require("./processAttestation");
const processDeposit_1 = require("./processDeposit");
const processVoluntaryExit_1 = require("./processVoluntaryExit");
function processOperations(state, body, verifySignatures = true) {
    // verify that outstanding deposits are processed up to the maximum number of deposits
    const maxDeposits = Math.min(lodestar_params_1.MAX_DEPOSITS, state.eth1Data.depositCount - state.eth1DepositIndex);
    if (body.deposits.length !== maxDeposits) {
        throw new Error(`Block contains incorrect number of deposits: depositCount=${body.deposits.length} expected=${maxDeposits}`);
    }
    for (const [operations, processOp] of [
        [body.proposerSlashings, processProposerSlashing_1.processProposerSlashing],
        [body.attesterSlashings, processAttesterSlashing_1.processAttesterSlashing],
        [body.attestations, processAttestation_1.processAttestation],
        [body.deposits, processDeposit_1.processDeposit],
        [body.voluntaryExits, processVoluntaryExit_1.processVoluntaryExit],
    ]) {
        for (const op of (0, ssz_1.readonlyValues)(operations)) {
            processOp(state, op, verifySignatures);
        }
    }
}
exports.processOperations = processOperations;
//# sourceMappingURL=processOperations.js.map