"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceList = void 0;
/**
 * Manage balances of BeaconState, use this instead of state.balances
 */
class BalanceList {
    constructor(type, tree) {
        this.type = type;
        this.tree = tree;
    }
    get length() {
        return this.type.tree_getLength(this.tree);
    }
    get(index) {
        return this.type.tree_getProperty(this.tree, index);
    }
    set(index, value) {
        this.type.tree_setProperty(this.tree, index, value);
    }
    applyDelta(index, delta) {
        return this.type.tree_applyDeltaAtIndex(this.tree, index, delta);
    }
    applyDeltaInBatch(deltaByIndex) {
        this.type.tree_applyDeltaInBatch(this.tree, deltaByIndex);
    }
    /** Return the new balances */
    updateAll(deltas) {
        const [newTree, newBalances] = this.type.tree_newTreeFromDeltas(this.tree, deltas);
        this.tree.rootNode = newTree.rootNode;
        this.type.tree_setLength(this.tree, newBalances.length);
        return newBalances;
    }
    push(value) {
        return this.type.tree_push(this.tree, value);
    }
    pop() {
        return this.type.tree_pop(this.tree);
    }
    *[Symbol.iterator]() {
        for (let i = 0; i < this.length; i++) {
            yield this.get(i);
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
}
exports.BalanceList = BalanceList;
//# sourceMappingURL=balanceList.js.map