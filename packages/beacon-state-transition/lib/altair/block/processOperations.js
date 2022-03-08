"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOperations = void 0;
const ssz_1 = require("@chainsafe/ssz");
const processProposerSlashing_1 = require("./processProposerSlashing");
const processAttesterSlashing_1 = require("./processAttesterSlashing");
const processAttestation_1 = require("./processAttestation");
const processDeposit_1 = require("./processDeposit");
const processVoluntaryExit_1 = require("./processVoluntaryExit");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
function processOperations(state, body, verifySignatures = true) {
    // verify that outstanding deposits are processed up to the maximum number of deposits
    const maxDeposits = Math.min(lodestar_params_1.MAX_DEPOSITS, state.eth1Data.depositCount - state.eth1DepositIndex);
    if (body.deposits.length !== maxDeposits) {
        throw new Error(`Block contains incorrect number of deposits: depositCount=${body.deposits.length} expected=${maxDeposits}`);
    }
    for (const proposerSlashing of (0, ssz_1.readonlyValues)(body.proposerSlashings)) {
        (0, processProposerSlashing_1.processProposerSlashing)(state, proposerSlashing, verifySignatures);
    }
    for (const attesterSlashing of (0, ssz_1.readonlyValues)(body.attesterSlashings)) {
        (0, processAttesterSlashing_1.processAttesterSlashing)(state, attesterSlashing, verifySignatures);
    }
    (0, processAttestation_1.processAttestations)(state, Array.from((0, ssz_1.readonlyValues)(body.attestations)), verifySignatures);
    for (const deposit of (0, ssz_1.readonlyValues)(body.deposits)) {
        (0, processDeposit_1.processDeposit)(state, deposit);
    }
    for (const voluntaryExit of (0, ssz_1.readonlyValues)(body.voluntaryExits)) {
        (0, processVoluntaryExit_1.processVoluntaryExit)(state, voluntaryExit, verifySignatures);
    }
}
exports.processOperations = processOperations;
//# sourceMappingURL=processOperations.js.map