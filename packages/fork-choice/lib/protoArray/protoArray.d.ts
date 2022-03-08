import { Epoch, RootHex } from "@chainsafe/lodestar-types";
import { IProtoBlock, IProtoNode } from "./interface";
export declare const DEFAULT_PRUNE_THRESHOLD = 0;
declare type ProposerBoost = {
    root: RootHex;
    score: number;
};
export declare class ProtoArray {
    pruneThreshold: number;
    justifiedEpoch: Epoch;
    justifiedRoot: RootHex;
    finalizedEpoch: Epoch;
    finalizedRoot: RootHex;
    nodes: IProtoNode[];
    indices: Map<RootHex, number>;
    private previousProposerBoost?;
    constructor({ pruneThreshold, justifiedEpoch, justifiedRoot, finalizedEpoch, finalizedRoot, }: {
        pruneThreshold: number;
        justifiedEpoch: Epoch;
        justifiedRoot: RootHex;
        finalizedEpoch: Epoch;
        finalizedRoot: RootHex;
    });
    static initialize(block: Omit<IProtoBlock, "targetRoot">): ProtoArray;
    /**
     * Iterate backwards through the array, touching all nodes and their parents and potentially
     * the best-child of each parent.
     *
     * The structure of the `self.nodes` array ensures that the child of each node is always
     * touched before its parent.
     *
     * For each node, the following is done:
     *
     * - Update the node's weight with the corresponding delta.
     * - Back-propagate each node's delta to its parents delta.
     * - Compare the current node with the parents best-child, updating it if the current node
     * should become the best child.
     * - If required, update the parents best-descendant with the current node or its best-descendant.
     */
    applyScoreChanges({ deltas, proposerBoost, justifiedEpoch, justifiedRoot, finalizedEpoch, finalizedRoot, }: {
        deltas: number[];
        proposerBoost: ProposerBoost | null;
        justifiedEpoch: Epoch;
        justifiedRoot: RootHex;
        finalizedEpoch: Epoch;
        finalizedRoot: RootHex;
    }): void;
    /**
     * Register a block with the fork choice.
     *
     * It is only sane to supply an undefined parent for the genesis block
     */
    onBlock(block: IProtoBlock): void;
    /**
     * Follows the best-descendant links to find the best-block (i.e., head-block).
     */
    findHead(justifiedRoot: RootHex): RootHex;
    /**
     * Update the tree with new finalization information. The tree is only actually pruned if both
     * of the two following criteria are met:
     *
     * - The supplied finalized epoch and root are different to the current values.
     * - The number of nodes in `self` is at least `self.prune_threshold`.
     *
     * # Errors
     *
     * Returns errors if:
     *
     * - The finalized epoch is less than the current one.
     * - The finalized epoch is equal to the current one, but the finalized root is different.
     * - There is some internal error relating to invalid indices inside `this`.
     */
    maybePrune(finalizedRoot: RootHex): IProtoBlock[];
    /**
     * Observe the parent at `parent_index` with respect to the child at `child_index` and
     * potentially modify the `parent.best_child` and `parent.best_descendant` values.
     *
     * ## Detail
     *
     * There are four outcomes:
     *
     * - The child is already the best child but it's now invalid due to a FFG change and should be removed.
     * - The child is already the best child and the parent is updated with the new
     * best-descendant.
     * - The child is not the best child but becomes the best child.
     * - The child is not the best child and does not become the best child.
     */
    maybeUpdateBestChildAndDescendant(parentIndex: number, childIndex: number): void;
    /**
     * Indicates if the node itself is viable for the head, or if it's best descendant is viable
     * for the head.
     */
    nodeLeadsToViableHead(node: IProtoNode): boolean;
    /**
     * This is the equivalent to the `filter_block_tree` function in the eth2 spec:
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v1.0.1/specs/phase0/fork-choice.md#filter_block_tree
     *
     * Any node that has a different finalized or justified epoch should not be viable for the
     * head.
     */
    nodeIsViableForHead(node: IProtoNode): boolean;
    /**
     * Iterate from a block root backwards over nodes
     */
    iterateAncestorNodes(blockRoot: RootHex): IterableIterator<IProtoNode>;
    /**
     * Iterate from a block root backwards over nodes
     */
    iterateAncestorNodesFromNode(node: IProtoNode): IterableIterator<IProtoNode>;
    /**
     * Get all nodes from a block root backwards
     */
    getAllAncestorNodes(blockRoot: RootHex): IProtoNode[];
    /**
     * The opposite of iterateNodes.
     * iterateNodes is to find ancestor nodes of a blockRoot.
     * this is to find non-ancestor nodes of a blockRoot.
     */
    getAllNonAncestorNodes(blockRoot: RootHex): IProtoNode[];
    hasBlock(blockRoot: RootHex): boolean;
    getNode(blockRoot: RootHex): IProtoNode | undefined;
    getBlock(blockRoot: RootHex): IProtoBlock | undefined;
    /**
     * Returns `true` if the `descendantRoot` has an ancestor with `ancestorRoot`.
     * Always returns `false` if either input roots are unknown.
     * Still returns `true` if `ancestorRoot` === `descendantRoot` (and the roots are known)
     */
    isDescendant(ancestorRoot: RootHex, descendantRoot: RootHex): boolean;
    /**
     * Returns a common ancestor for nodeA or nodeB or null if there's none
     */
    getCommonAncestor(nodeA: IProtoNode, nodeB: IProtoNode): IProtoNode | null;
    length(): number;
    private getNodeFromIndex;
    private getNodeByIndex;
    private getNodesBetween;
}
export {};
//# sourceMappingURL=protoArray.d.ts.map