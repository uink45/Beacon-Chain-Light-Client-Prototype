"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeSSZState = exports.initDevState = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const deposits_1 = require("./interop/deposits");
const state_1 = require("./interop/state");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const constants_1 = require("../../constants");
async function initDevState(config, db, validatorCount, interopStateOpts) {
    const deposits = (0, deposits_1.interopDeposits)(config, lodestar_types_1.ssz.phase0.DepositDataRootList.defaultTreeBacked(), validatorCount);
    await storeDeposits(config, db, deposits);
    const state = (0, state_1.getInteropState)(config, interopStateOpts, deposits, await db.depositDataRoot.getTreeBacked(validatorCount - 1));
    const block = config.getForkTypes(constants_1.GENESIS_SLOT).SignedBeaconBlock.defaultValue();
    block.message.stateRoot = config.getForkTypes(state.slot).BeaconState.hashTreeRoot(state);
    await db.blockArchive.add(block);
    return state;
}
exports.initDevState = initDevState;
function storeSSZState(config, state, path) {
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(path), { recursive: true });
    (0, node_fs_1.writeFileSync)(path, config.getForkTypes(state.slot).BeaconState.serialize(state));
}
exports.storeSSZState = storeSSZState;
async function storeDeposits(config, db, deposits) {
    for (let i = 0; i < deposits.length; i++) {
        await Promise.all([
            db.depositEvent.put(i, {
                blockNumber: i,
                index: i,
                depositData: deposits[i].data,
            }),
            db.depositDataRoot.put(i, lodestar_types_1.ssz.phase0.DepositData.hashTreeRoot(deposits[i].data)),
        ]);
    }
}
//# sourceMappingURL=state.js.map