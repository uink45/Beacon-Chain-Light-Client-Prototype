"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapTracker = void 0;
class MapTracker extends Map {
    constructor(metrics) {
        super();
        /** Tracks the number of reads each entry in the cache gets for metrics */
        this.readCount = new Map();
        /** Tracks the last time a state was read from the cache */
        this.lastRead = new Map();
        if (metrics) {
            metrics.reads.addGetValuesFn(() => Array.from(this.readCount.values()));
            metrics.secondsSinceLastRead.addGetValuesFn(() => {
                const now = Date.now();
                const secondsSinceLastRead = [];
                for (const lastRead of this.lastRead.values()) {
                    secondsSinceLastRead.push((now - lastRead) / 1000);
                }
                return secondsSinceLastRead;
            });
        }
    }
    get(key) {
        var _a;
        const value = super.get(key);
        if (value !== undefined) {
            this.readCount.set(key, 1 + ((_a = this.readCount.get(key)) !== null && _a !== void 0 ? _a : 0));
            this.lastRead.set(key, Date.now());
        }
        return value;
    }
    delete(key) {
        const deleted = super.delete(key);
        if (deleted) {
            this.readCount.delete(key);
            this.lastRead.delete(key);
        }
        return deleted;
    }
    clear() {
        super.clear();
        this.readCount.clear();
        this.lastRead.clear();
    }
}
exports.MapTracker = MapTracker;
//# sourceMappingURL=mapMetrics.js.map