"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedEpochParticipationProxyHandler = exports.CachedEpochParticipation = void 0;
const unsafeUint8ArrayToTree_1 = require("../util/unsafeUint8ArrayToTree");
class CachedEpochParticipation {
    constructor(opts) {
        this.type = opts.type;
        this.tree = opts.tree;
        this.persistent = opts.persistent;
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
        if (this.type && this.tree)
            this.type.tree_setProperty(this.tree, index, value);
    }
    updateAllStatus(data) {
        this.persistent.vector = data;
        if (this.type && this.tree) {
            const packedData = new Uint8Array(data.length);
            data.forEach((d, i) => (packedData[i] = d));
            this.tree.rootNode = (0, unsafeUint8ArrayToTree_1.unsafeUint8ArrayToTree)(packedData, this.type.getChunkDepth());
            this.type.tree_setLength(this.tree, data.length);
        }
    }
    push(value) {
        this.persistent.push(value);
        if (this.type && this.tree)
            this.type.tree_push(this.tree, value);
        return this.persistent.length;
    }
    pop() {
        const popped = this.persistent.pop();
        if (this.type && this.tree)
            this.type.tree_pop(this.tree);
        if (popped === undefined)
            return undefined;
        return popped;
    }
    *[Symbol.iterator]() {
        for (const data of this.persistent) {
            yield data;
        }
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
        this.persistent.forEach((value, index) => fn(value, index));
    }
    map(fn) {
        return this.persistent.map((value, index) => fn(value, index));
    }
    forEachStatus(fn) {
        this.persistent.forEach(fn);
    }
    mapStatus(fn) {
        return this.persistent.map((value, index) => fn(value, index));
    }
}
exports.CachedEpochParticipation = CachedEpochParticipation;
// eslint-disable-next-line @typescript-eslint/naming-convention
exports.CachedEpochParticipationProxyHandler = {
    get(target, key) {
        if (!Number.isNaN(Number(String(key)))) {
            return target.get(key);
        }
        else if (target[key] !== undefined) {
            return target[key];
        }
        else {
            if (target.type && target.tree) {
                const treeBacked = target.type.createTreeBacked(target.tree);
                if (key in treeBacked) {
                    return treeBacked[key];
                }
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
//# sourceMappingURL=cachedEpochParticipation.js.map