import { Slot, RootHex } from "@chainsafe/lodestar-types";
import { IMetrics } from "../metrics";
/**
 * To prevent our node from having to reprocess while struggling to sync,
 * we only want to reprocess attestations if block reaches our node before this time.
 */
export declare const REPROCESS_MIN_TIME_TO_NEXT_SLOT_SEC = 2;
declare type SlotRoot = {
    slot: Slot;
    root: RootHex;
};
/**
 * Some attestations may reach our node before the voted block, so we manage a cache to reprocess them
 * when the block come.
 * (n)                                               (n + 1)
 *  |----------------|----------------|----------|------|
 *                   |                |          |
 *                  att           agg att        |
 *                                              block
 * Since the gossip handler has to return validation result to js-libp2p-gossipsub, this class should not
 * reprocess attestations, it should control when the attestations are ready to reprocess instead.
 */
export declare class ReprocessController {
    private readonly metrics;
    private readonly awaitingPromisesByRootBySlot;
    private awaitingPromisesCount;
    constructor(metrics: IMetrics | null);
    /**
     * Returns Promise that resolves either on block found or once 1 slot passes.
     * Used to handle unknown block root for both unaggregated and aggregated attestations.
     * @returns true if blockFound
     */
    waitForBlockOfAttestation(slot: Slot, root: RootHex): Promise<boolean>;
    /**
     * It's important to make sure our node is synced before we reprocess,
     * it means the processed slot is same to clock slot
     * Note that we want to use clock advanced by REPROCESS_MIN_TIME_TO_NEXT_SLOT instead of
     * clockSlot because we want to make sure our node is healthy while reprocessing attestations.
     * If a block reach our node 1s before the next slot, for example, then probably node
     * is struggling and we don't want to reprocess anything at that time.
     */
    onBlockImported({ slot: blockSlot, root }: SlotRoot, advancedSlot: Slot): void;
    /**
     * It's important to make sure our node is synced before reprocessing attestations,
     * it means clockSlot is the same to last processed block's slot, and we don't reprocess
     * attestations of old slots.
     * So we reject and prune all old awaiting promises per clock slot.
     * @param clockSlot
     */
    onSlot(clockSlot: Slot): void;
}
export {};
//# sourceMappingURL=reprocess.d.ts.map