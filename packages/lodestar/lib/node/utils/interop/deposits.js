"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interopDeposits = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
/**
 * Compute and return deposit data from other validators.
 */
function interopDeposits(config, depositDataRootList, validatorCount) {
    const tree = depositDataRootList.tree;
    return (0, lodestar_beacon_state_transition_1.interopSecretKeys)(validatorCount).map((secretKey, i) => {
        const pubkey = secretKey.toPublicKey().toBytes();
        // create DepositData
        const data = {
            pubkey,
            withdrawalCredentials: Buffer.concat([lodestar_params_1.BLS_WITHDRAWAL_PREFIX, (0, ssz_1.hash)(pubkey).slice(1)]),
            amount: lodestar_params_1.MAX_EFFECTIVE_BALANCE,
            signature: Buffer.alloc(0),
        };
        const domain = (0, lodestar_beacon_state_transition_1.computeDomain)(lodestar_params_1.DOMAIN_DEPOSIT, config.GENESIS_FORK_VERSION, lodestar_beacon_state_transition_1.ZERO_HASH);
        const signingRoot = (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.phase0.DepositMessage, data, domain);
        data.signature = secretKey.sign(signingRoot).toBytes();
        // Add to merkle tree
        depositDataRootList.push(lodestar_types_1.ssz.phase0.DepositData.hashTreeRoot(data));
        return {
            proof: tree.getSingleProof(depositDataRootList.type.getPropertyGindex(i)),
            data,
        };
    });
}
exports.interopDeposits = interopDeposits;
//# sourceMappingURL=deposits.js.map