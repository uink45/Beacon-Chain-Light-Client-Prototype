"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepositsWithProofs = exports.getDeposits = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
const tree_1 = require("../../util/tree");
const errors_1 = require("../errors");
async function getDeposits(
// eth1_deposit_index represents the next deposit index to be added
state, eth1Data, depositsGetter) {
    const depositIndex = state.eth1DepositIndex;
    const depositCount = eth1Data.depositCount;
    if (depositIndex > depositCount) {
        throw new errors_1.Eth1Error({ code: errors_1.Eth1ErrorCode.DEPOSIT_INDEX_TOO_HIGH, depositIndex, depositCount });
    }
    // Spec v0.12.2
    // assert len(body.deposits) == min(MAX_DEPOSITS, state.eth1_data.deposit_count - state.eth1_deposit_index)
    const depositsLen = Math.min(lodestar_params_1.MAX_DEPOSITS, depositCount - depositIndex);
    const indexRange = { gte: depositIndex, lt: depositIndex + depositsLen };
    const deposits = await depositsGetter(indexRange, eth1Data);
    if (deposits.length < depositsLen) {
        throw new errors_1.Eth1Error({ code: errors_1.Eth1ErrorCode.NOT_ENOUGH_DEPOSITS, len: deposits.length, expectedLen: depositsLen });
    }
    else if (deposits.length > depositsLen) {
        throw new errors_1.Eth1Error({ code: errors_1.Eth1ErrorCode.TOO_MANY_DEPOSITS, len: deposits.length, expectedLen: depositsLen });
    }
    return deposits;
}
exports.getDeposits = getDeposits;
function getDepositsWithProofs(depositEvents, depositRootTree, eth1Data) {
    // Get tree at this particular depositCount to compute correct proofs
    const treeAtDepositCount = (0, tree_1.getTreeAtIndex)(depositRootTree, eth1Data.depositCount - 1);
    const depositRoot = treeAtDepositCount.hashTreeRoot();
    if (!lodestar_types_1.ssz.Root.equals(depositRoot, eth1Data.depositRoot)) {
        throw new errors_1.Eth1Error({
            code: errors_1.Eth1ErrorCode.WRONG_DEPOSIT_ROOT,
            root: (0, ssz_1.toHexString)(depositRoot),
            expectedRoot: (0, ssz_1.toHexString)(eth1Data.depositRoot),
        });
    }
    return depositEvents.map((log) => ({
        proof: treeAtDepositCount.tree.getSingleProof(treeAtDepositCount.type.getPropertyGindex(log.index)),
        data: log.depositData,
    }));
}
exports.getDepositsWithProofs = getDepositsWithProofs;
//# sourceMappingURL=deposits.js.map