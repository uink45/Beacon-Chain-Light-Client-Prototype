"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebugApi = void 0;
const multiaddr_1 = require("multiaddr");
const peer_id_1 = require("peer-id");
const utils_1 = require("../beacon/state/utils");
function getDebugApi({ chain, config, db, network, }) {
    return {
        async getHeads() {
            const heads = chain.forkChoice.getHeads();
            return {
                data: heads.map((blockSummary) => ({ slot: blockSummary.slot, root: blockSummary.blockRoot })),
            };
        },
        async getState(stateId, format) {
            const state = await (0, utils_1.resolveStateId)(config, chain, db, stateId, { regenFinalizedState: true });
            if (format === "ssz") {
                // Casting to any otherwise Typescript doesn't like the multi-type return
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
                return config.getForkTypes(state.slot).BeaconState.serialize(state);
            }
            else {
                return { data: state };
            }
        },
        async getStateV2(stateId, format) {
            const state = await (0, utils_1.resolveStateId)(config, chain, db, stateId, { regenFinalizedState: true });
            if (format === "ssz") {
                // Casting to any otherwise Typescript doesn't like the multi-type return
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
                return config.getForkTypes(state.slot).BeaconState.serialize(state);
            }
            else {
                return { data: state, version: config.getForkName(state.slot) };
            }
        },
        async connectToPeer(peerIdStr, multiaddrStr) {
            const peer = (0, peer_id_1.createFromB58String)(peerIdStr);
            const multiaddr = multiaddrStr.map((addr) => new multiaddr_1.Multiaddr(addr));
            await network.connectToPeer(peer, multiaddr);
        },
        async disconnectPeer(peerIdStr) {
            const peer = (0, peer_id_1.createFromB58String)(peerIdStr);
            await network.disconnectPeer(peer);
        },
    };
}
exports.getDebugApi = getDebugApi;
//# sourceMappingURL=index.js.map