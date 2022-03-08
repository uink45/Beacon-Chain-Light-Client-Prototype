import { Number64ListType } from "@chainsafe/ssz";
import { Tree } from "@chainsafe/persistent-merkle-tree";
/**
 * Manage balances of BeaconState, use this instead of state.balances
 */
export declare class BalanceList {
    tree: Tree;
    type: Number64ListType;
    constructor(type: Number64ListType, tree: Tree);
    get length(): number;
    get(index: number): number | undefined;
    set(index: number, value: number): void;
    applyDelta(index: number, delta: number): number;
    applyDeltaInBatch(deltaByIndex: Map<number, number>): void;
    /** Return the new balances */
    updateAll(deltas: number[]): number[];
    push(value: number): number;
    pop(): number;
    [Symbol.iterator](): Iterator<number>;
    find(fn: (value: number, index: number, list: this) => boolean): number | undefined;
    findIndex(fn: (value: number, index: number, list: this) => boolean): number;
}
//# sourceMappingURL=balanceList.d.ts.map