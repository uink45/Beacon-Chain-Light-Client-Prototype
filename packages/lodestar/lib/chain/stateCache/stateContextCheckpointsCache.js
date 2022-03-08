"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCheckpointKey = exports.toCheckpointHex = exports.CheckpointStateCache = void 0;
const ssz_1 = require("@chainsafe/ssz");
const mapMetrics_1 = require("./mapMetrics");
const map_1 = require("../../util/map");
const MAX_EPOCHS = 10;
/**
 * In memory cache of CachedBeaconState
 * belonging to checkpoint
 *
 * Similar API to Repository
 */
class CheckpointStateCache {
    constructor({ metrics }) {
        /** Epoch -> Set<blockRoot> */
        this.epochIndex = new map_1.MapDef(() => new Set());
        this.preComputedCheckpoint = null;
        this.preComputedCheckpointHits = null;
        this.cache = new mapMetrics_1.MapTracker(metrics === null || metrics === void 0 ? void 0 : metrics.cpStateCache);
        if (metrics) {
            this.metrics = metrics.cpStateCache;
            metrics.cpStateCache.size.addCollect(() => metrics.cpStateCache.size.set(this.cache.size));
            metrics.cpStateCache.epochSize.addCollect(() => metrics.cpStateCache.epochSize.set(this.epochIndex.size));
        }
    }
    get(cp) {
        var _a, _b, _c;
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.lookups.inc();
        const cpKey = toCheckpointKey(cp);
        const item = this.cache.get(cpKey);
        if (item) {
            (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.hits.inc();
            if (cpKey === this.preComputedCheckpoint) {
                this.preComputedCheckpointHits = ((_c = this.preComputedCheckpointHits) !== null && _c !== void 0 ? _c : 0) + 1;
            }
        }
        return item ? item.clone() : null;
    }
    add(cp, item) {
        var _a;
        const cpHex = toCheckpointHex(cp);
        const key = toCheckpointKey(cpHex);
        if (this.cache.has(key)) {
            return;
        }
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.adds.inc();
        this.cache.set(key, item.clone());
        this.epochIndex.getOrDefault(cp.epoch).add(cpHex.rootHex);
    }
    /**
     * Searches for the latest cached state with a `root`, starting with `epoch` and descending
     */
    getLatest(rootHex, maxEpoch) {
        var _a;
        // sort epochs in descending order, only consider epochs lte `epoch`
        const epochs = Array.from(this.epochIndex.keys())
            .sort((a, b) => b - a)
            .filter((e) => e <= maxEpoch);
        for (const epoch of epochs) {
            if ((_a = this.epochIndex.get(epoch)) === null || _a === void 0 ? void 0 : _a.has(rootHex)) {
                return this.get({ rootHex, epoch });
            }
        }
        return null;
    }
    /**
     * Update the precomputed checkpoint and return the number of his for the
     * previous one (if any).
     */
    updatePreComputedCheckpoint(rootHex, epoch) {
        const previousHits = this.preComputedCheckpointHits;
        this.preComputedCheckpoint = toCheckpointKey({ rootHex, epoch });
        this.preComputedCheckpointHits = 0;
        return previousHits;
    }
    pruneFinalized(finalizedEpoch) {
        for (const epoch of this.epochIndex.keys()) {
            if (epoch < finalizedEpoch) {
                this.deleteAllEpochItems(epoch);
            }
        }
    }
    prune(finalizedEpoch, justifiedEpoch) {
        const epochs = Array.from(this.epochIndex.keys()).filter((epoch) => epoch !== finalizedEpoch && epoch !== justifiedEpoch);
        if (epochs.length > MAX_EPOCHS) {
            for (const epoch of epochs.slice(0, epochs.length - MAX_EPOCHS)) {
                this.deleteAllEpochItems(epoch);
            }
        }
    }
    delete(cp) {
        this.cache.delete(toCheckpointKey(toCheckpointHex(cp)));
        const epochKey = (0, ssz_1.toHexString)(cp.root);
        const value = this.epochIndex.get(cp.epoch);
        if (value) {
            value.delete(epochKey);
            if (value.size === 0) {
                this.epochIndex.delete(cp.epoch);
            }
        }
    }
    deleteAllEpochItems(epoch) {
        for (const rootHex of this.epochIndex.get(epoch) || []) {
            this.cache.delete(toCheckpointKey({ rootHex, epoch }));
        }
        this.epochIndex.delete(epoch);
    }
    clear() {
        this.cache.clear();
        this.epochIndex.clear();
    }
    /** ONLY FOR DEBUGGING PURPOSES. For lodestar debug API */
    dumpSummary() {
        return Array.from(this.cache.entries()).map(([key, state]) => {
            var _a, _b;
            return ({
                slot: state.slot,
                root: (0, ssz_1.toHexString)(state.hashTreeRoot()),
                reads: (_a = this.cache.readCount.get(key)) !== null && _a !== void 0 ? _a : 0,
                lastRead: (_b = this.cache.lastRead.get(key)) !== null && _b !== void 0 ? _b : 0,
            });
        });
    }
    /** ONLY FOR DEBUGGING PURPOSES. For spec tests on error */
    dumpCheckpointKeys() {
        return Array.from(this.cache.keys());
    }
}
exports.CheckpointStateCache = CheckpointStateCache;
function toCheckpointHex(checkpoint) {
    return {
        epoch: checkpoint.epoch,
        rootHex: (0, ssz_1.toHexString)(checkpoint.root),
    };
}
exports.toCheckpointHex = toCheckpointHex;
function toCheckpointKey(cp) {
    return `${cp.rootHex}:${cp.epoch}`;
}
exports.toCheckpointKey = toCheckpointKey;
//# sourceMappingURL=stateContextCheckpointsCache.js.map