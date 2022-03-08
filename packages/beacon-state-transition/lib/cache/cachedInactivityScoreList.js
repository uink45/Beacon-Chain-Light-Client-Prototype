"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedInactivityScoreListProxyHandler = exports.CachedInactivityScoreList = void 0;
/**
 * Inactivity score implementation that synchronizes changes between two underlying implementations:
 *   an immutable-js-style backing and a merkle tree backing
 */
class CachedInactivityScoreList {
    constructor(type, tree, persistent) {
        this.type = type;
        this.tree = tree;
        this.persistent = persistent;
    }
    get length() {
        return this.persistent.length;
    }
    get(index) {
        var _a;
        return (_a = this.persistent.get(index)) !== null && _a !== void 0 ? _a : undefined;
    }
    set(index, value) {
        this.persistent.set(index, value);
        this.type.tree_setProperty(this.tree, index, value);
    }
    setMultiple(newValues) {
        // TODO: based on newValues.size to determine we build the tree from scratch or not
        for (const [index, value] of newValues.entries()) {
            this.set(index, value);
        }
    }
    push(value) {
        this.persistent.push(value);
        return this.type.tree_push(this.tree, value);
    }
    pop() {
        this.type.tree_pop(this.tree);
        return this.persistent.pop();
    }
    *[Symbol.iterator]() {
        yield* this.persistent[Symbol.iterator]();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    find(fn) {
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    findIndex(fn) {
        return -1;
    }
    forEach(fn) {
        this.persistent.forEach(fn);
    }
    map(fn) {
        return this.persistent.map(fn);
    }
}
exports.CachedInactivityScoreList = CachedInactivityScoreList;
// eslint-disable-next-line @typescript-eslint/naming-convention
exports.CachedInactivityScoreListProxyHandler = {
    get(target, key) {
        if (!Number.isNaN(Number(String(key)))) {
            return target.get(key);
        }
        else if (target[key] !== undefined) {
            return target[key];
        }
        else {
            const treeBacked = target.type.createTreeBacked(target.tree);
            if (key in treeBacked) {
                return treeBacked[key];
            }
            return undefined;
        }
    },
    set(target, key, value) {
        if (!Number.isNaN(Number(key))) {
            target.set(key, value);
            return true;
        }
        return false;
    },
};
//# sourceMappingURL=cachedInactivityScoreList.js.map