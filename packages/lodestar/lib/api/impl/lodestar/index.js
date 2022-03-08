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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLodestarApi = void 0;
const peer_id_1 = __importDefault(require("peer-id"));
const multiaddr_1 = require("multiaddr");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
function getLodestarApi({ chain, config, network, sync, }) {
    let writingHeapdump = false;
    return {
        /**
         * Get a wtfnode dump of all active handles
         * Will only load the wtfnode after the first call, and registers async hooks
         * and other listeners to the global process instance
         */
        async getWtfNode() {
            // Browser interop
            if (typeof require !== "function")
                throw Error("NodeJS only");
            // eslint-disable-next-line
            const wtfnode = require("wtfnode");
            const logs = [];
            function logger(...args) {
                for (const arg of args)
                    logs.push(arg);
            }
            /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
            wtfnode.setLogger("info", logger);
            wtfnode.setLogger("warn", logger);
            wtfnode.setLogger("error", logger);
            wtfnode.dump();
            return { data: logs.join("\n") };
        },
        async writeHeapdump(dirpath = ".") {
            // Browser interop
            if (typeof require !== "function")
                throw Error("NodeJS only");
            if (writingHeapdump) {
                throw Error("Already writing heapdump");
            }
            // Lazily import NodeJS only modules
            const fs = await Promise.resolve().then(() => __importStar(require("node:fs")));
            const v8 = await Promise.resolve().then(() => __importStar(require("v8")));
            const snapshotStream = v8.getHeapSnapshot();
            // It's important that the filename end with `.heapsnapshot`,
            // otherwise Chrome DevTools won't open it.
            const filepath = `${dirpath}/${new Date().toISOString()}.heapsnapshot`;
            const fileStream = fs.createWriteStream(filepath);
            try {
                writingHeapdump = true;
                await new Promise((resolve) => {
                    snapshotStream.pipe(fileStream);
                    snapshotStream.on("end", () => {
                        resolve();
                    });
                });
                return { data: { filepath } };
            }
            finally {
                writingHeapdump = false;
            }
        },
        async getLatestWeakSubjectivityCheckpointEpoch() {
            const state = chain.getHeadState();
            return { data: (0, lodestar_beacon_state_transition_1.getLatestWeakSubjectivityCheckpointEpoch)(config, state) };
        },
        async getSyncChainsDebugState() {
            return { data: sync.getSyncChainsDebugState() };
        },
        async getGossipQueueItems(gossipType) {
            const jobQueue = network.gossip.jobQueues[gossipType];
            if (jobQueue === undefined) {
                throw Error(`Unknown gossipType ${gossipType}, known values: ${Object.keys(jobQueue).join(", ")}`);
            }
            return jobQueue.getItems().map((item) => {
                const [topic, message] = item.args;
                return {
                    topic: topic,
                    receivedFrom: message.receivedFrom,
                    data: message.data,
                    addedTimeMs: item.addedTimeMs,
                };
            });
        },
        async getRegenQueueItems() {
            return chain.regen.jobQueue.getItems().map((item) => ({
                key: item.args[0].key,
                args: regenRequestToJson(config, item.args[0]),
                addedTimeMs: item.addedTimeMs,
            }));
        },
        async getBlockProcessorQueueItems() {
            return chain["blockProcessor"].jobQueue.getItems().map((item) => {
                const [job] = item.args;
                const jobs = Array.isArray(job) ? job : [job];
                return {
                    blockSlots: jobs.map((j) => j.block.message.slot),
                    jobOpts: {
                        skipImportingAttestations: jobs[0].skipImportingAttestations,
                        validProposerSignature: jobs[0].validProposerSignature,
                        validSignatures: jobs[0].validSignatures,
                    },
                    addedTimeMs: item.addedTimeMs,
                };
            });
        },
        async getStateCacheItems() {
            return chain["stateCache"].dumpSummary();
        },
        async getCheckpointStateCacheItems() {
            return chain["checkpointStateCache"].dumpSummary();
        },
        async runGC() {
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (!global.gc)
                throw Error("You must expose GC running the Node.js process with 'node --expose_gc'");
            global.gc();
        },
        async dropStateCache() {
            chain.stateCache.clear();
            chain.checkpointStateCache.clear();
        },
        async connectPeer(peerIdStr, multiaddrStrs) {
            const peerId = peer_id_1.default.createFromB58String(peerIdStr);
            const multiaddrs = multiaddrStrs.map((multiaddrStr) => new multiaddr_1.Multiaddr(multiaddrStr));
            await network.connectToPeer(peerId, multiaddrs);
        },
        async disconnectPeer(peerIdStr) {
            const peerId = peer_id_1.default.createFromB58String(peerIdStr);
            await network.disconnectPeer(peerId);
        },
        async discv5GetKadValues() {
            var _a, _b;
            return {
                data: (_b = (_a = network.discv5) === null || _a === void 0 ? void 0 : _a.kadValues().map((enr) => enr.encodeTxt())) !== null && _b !== void 0 ? _b : [],
            };
        },
    };
}
exports.getLodestarApi = getLodestarApi;
function regenRequestToJson(config, regenRequest) {
    switch (regenRequest.key) {
        case "getBlockSlotState":
            return {
                root: regenRequest.args[0],
                slot: regenRequest.args[1],
            };
        case "getCheckpointState":
            return lodestar_types_1.ssz.phase0.Checkpoint.toJson(regenRequest.args[0]);
        case "getPreState": {
            const slot = regenRequest.args[0].slot;
            return {
                root: (0, ssz_1.toHexString)(config.getForkTypes(slot).BeaconBlock.hashTreeRoot(regenRequest.args[0])),
                slot,
            };
        }
        case "getState":
            return {
                root: regenRequest.args[0],
            };
    }
}
//# sourceMappingURL=index.js.map