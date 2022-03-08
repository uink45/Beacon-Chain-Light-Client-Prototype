"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateContextCache = void 0;
const ssz_1 = require("@chainsafe/ssz");
const mapMetrics_1 = require("./mapMetrics");
const MAX_STATES = 3 * 32;
/**
 * In memory cache of CachedBeaconState
 *
 * Similar API to Repository
 */
class StateContextCache {
    constructor({ maxStates = MAX_STATES, metrics }) {
        /** Epoch -> Set<blockRoot> */
        this.epochIndex = new Map();
        this.maxStates = maxStates;
        this.cache = new mapMetrics_1.MapTracker(metrics === null || metrics === void 0 ? void 0 : metrics.stateCache);
        if (metrics) {
            this.metrics = metrics.stateCache;
            metrics.stateCache.size.addCollect(() => metrics.stateCache.size.set(this.cache.size));
        }
    }
    get(rootHex) {
        var _a, _b;
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.lookups.inc();
        const item = this.cache.get(rootHex);
        if (!item) {
            return null;
        }
        (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.hits.inc();
        return item.clone();
    }
    add(item) {
        var _a;
        const key = (0, ssz_1.toHexString)(item.hashTreeRoot());
        if (this.cache.get(key)) {
            return;
        }
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.adds.inc();
        this.cache.set(key, item.clone());
        const epoch = item.epochCtx.currentShuffling.epoch;
        const blockRoots = this.epochIndex.get(epoch);
        if (blockRoots) {
            blockRoots.add(key);
        }
        else {
            this.epochIndex.set(epoch, new Set([key]));
        }
    }
    delete(root) {
        var _a;
        const key = (0, ssz_1.toHexString)(root);
        const item = this.cache.get(key);
        if (!item)
            return;
        (_a = this.epochIndex.get(item.epochCtx.currentShuffling.epoch)) === null || _a === void 0 ? void 0 : _a.delete(key);
        this.cache.delete(key);
    }
    batchDelete(roots) {
        roots.map((root) => this.delete(root));
    }
    clear() {
        this.cache.clear();
        this.epochIndex.clear();
    }
    get size() {
        return this.cache.size;
    }
    /**
     * TODO make this more robust.
     * Without more thought, this currently breaks our assumptions about recent state availablity
     */
    prune(headStateRootHex) {
        var _a;
        const keys = Array.from(this.cache.keys());
        if (keys.length > this.maxStates) {
            // object keys are stored in insertion order, delete keys starting from the front
            for (const key of keys.slice(0, keys.length - this.maxStates)) {
                if (key !== headStateRootHex) {
                    const item = this.cache.get(key);
                    if (item) {
                        (_a = this.epochIndex.get(item.epochCtx.currentShuffling.epoch)) === null || _a === void 0 ? void 0 : _a.delete(key);
                        this.cache.delete(key);
                    }
                }
            }
        }
    }
    /**
     * Prune per finalized epoch.
     */
    deleteAllBeforeEpoch(finalizedEpoch) {
        for (const epoch of this.epochIndex.keys()) {
            if (epoch < finalizedEpoch) {
                this.deleteAllEpochItems(epoch);
            }
        }
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
    deleteAllEpochItems(epoch) {
        for (const rootHex of this.epochIndex.get(epoch) || []) {
            this.cache.delete(rootHex);
        }
        this.epochIndex.delete(epoch);
    }
}
exports.StateContextCache = StateContextCache;
//# sourceMappingURL=stateContextCache.js.map