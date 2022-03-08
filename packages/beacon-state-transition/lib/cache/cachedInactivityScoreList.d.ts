import { BasicListType, List } from "@chainsafe/ssz";
import { Number64 } from "@chainsafe/lodestar-types";
import { Tree } from "@chainsafe/persistent-merkle-tree";
import { MutableVector } from "@chainsafe/persistent-ts";
/**
 * Inactivity score implementation that synchronizes changes between two underlying implementations:
 *   an immutable-js-style backing and a merkle tree backing
 */
export declare class CachedInactivityScoreList implements List<Number64> {
    [index: number]: Number64;
    tree: Tree;
    type: BasicListType<List<Number64>>;
    persistent: MutableVector<Number64>;
    constructor(type: BasicListType<List<Number64>>, tree: Tree, persistent: MutableVector<Number64>);
    get length(): number;
    get(index: number): Number64 | undefined;
    set(index: number, value: Number64): void;
    setMultiple(newValues: Map<number, Number64>): void;
    push(value: Number64): number;
    pop(): Number64;
    [Symbol.iterator](): Iterator<Number64>;
    find(fn: (value: Number64, index: number, list: this) => boolean): Number64 | undefined;
    findIndex(fn: (value: Number64, index: number, list: this) => boolean): number;
    forEach(fn: (value: Number64, index: number, list: this) => void): void;
    map<T>(fn: (value: Number64, index: number) => T): T[];
}
export declare const CachedInactivityScoreListProxyHandler: ProxyHandler<CachedInactivityScoreList>;
//# sourceMappingURL=cachedInactivityScoreList.d.ts.map