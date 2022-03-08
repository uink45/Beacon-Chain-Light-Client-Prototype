"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInteropState = exports.INTEROP_TIMESTAMP = exports.INTEROP_BLOCK_HASH = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
exports.INTEROP_BLOCK_HASH = Buffer.alloc(32, "B");
exports.INTEROP_TIMESTAMP = Math.pow(2, 40);
function getInteropState(config, { genesisTime = Math.floor(Date.now() / 1000), eth1BlockHash = exports.INTEROP_BLOCK_HASH, eth1Timestamp = exports.INTEROP_TIMESTAMP, }, deposits, fullDepositDataRootList) {
    const latestPayloadHeader = lodestar_types_1.ssz.bellatrix.ExecutionPayloadHeader.defaultTreeBacked();
    // TODO: when having different test options, consider modifying these values
    latestPayloadHeader.blockHash = eth1BlockHash;
    latestPayloadHeader.timestamp = eth1Timestamp;
    latestPayloadHeader.prevRandao = eth1BlockHash;
    latestPayloadHeader.gasLimit = lodestar_params_1.GENESIS_GAS_LIMIT;
    latestPayloadHeader.baseFeePerGas = lodestar_params_1.GENESIS_BASE_FEE_PER_GAS;
    const state = (0, lodestar_beacon_state_transition_1.initializeBeaconStateFromEth1)(config, eth1BlockHash, eth1Timestamp, deposits, fullDepositDataRootList, latestPayloadHeader);
    state.genesisTime = genesisTime;
    return state;
}
exports.getInteropState = getInteropState;
//# sourceMappingURL=state.js.map