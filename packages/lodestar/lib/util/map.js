"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneSetToMax = exports.Map2dArr = exports.Map2d = exports.MapDef = void 0;
class MapDef extends Map {
    constructor(getDefault) {
        super();
        this.getDefault = getDefault;
    }
    getOrDefault(key) {
        let value = super.get(key);
        if (value === undefined) {
            value = this.getDefault();
            this.set(key, value);
        }
        return value;
    }
}
exports.MapDef = MapDef;
/**
 * 2 dimensions Es6 Map
 */
class Map2d {
    constructor() {
        this.map = new Map();
    }
    get(k1, k2) {
        var _a;
        return (_a = this.map.get(k1)) === null || _a === void 0 ? void 0 : _a.get(k2);
    }
    set(k1, k2, v) {
        let map2 = this.map.get(k1);
        if (!map2) {
            map2 = new Map();
            this.map.set(k1, map2);
        }
        map2.set(k2, v);
    }
}
exports.Map2d = Map2d;
/**
 * 2 dimensions Es6 Map + regular array
 */
class Map2dArr {
    constructor() {
        this.map = new Map();
    }
    get(k1, idx) {
        var _a;
        return (_a = this.map.get(k1)) === null || _a === void 0 ? void 0 : _a[idx];
    }
    set(k1, idx, v) {
        let arr = this.map.get(k1);
        if (!arr) {
            arr = [];
            this.map.set(k1, arr);
        }
        arr[idx] = v;
    }
}
exports.Map2dArr = Map2dArr;
/**
 * Prune an arbitrary set removing the first keys to have a set.size === maxItems.
 * Returns the count of deleted items.
 */
function pruneSetToMax(set, maxItems) {
    let itemsToDelete = set.size - maxItems;
    const deletedItems = Math.max(0, itemsToDelete);
    if (itemsToDelete > 0) {
        for (const key of set.keys()) {
            set.delete(key);
            itemsToDelete--;
            if (itemsToDelete <= 0) {
                break;
            }
        }
    }
    return deletedItems;
}
exports.pruneSetToMax = pruneSetToMax;
//# sourceMappingURL=map.js.map