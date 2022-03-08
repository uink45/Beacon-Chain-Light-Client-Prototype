import { IForkChoice } from "@chainsafe/lodestar-fork-choice";
import { phase0 } from "@chainsafe/lodestar-types";
/** The type of peer relative to our current state */
export declare enum PeerSyncType {
    /** The peer is on our chain and is fully synced with respect to our chain */
    FullySynced = "FullySynced",
    /** The peer has a greater knowledge of the chain than us that warrants a full sync */
    Advanced = "Advanced",
    /** A peer is behind in the sync and not useful to us for downloading blocks */
    Behind = "Behind"
}
export declare const peerSyncTypes: PeerSyncType[];
export declare function getPeerSyncType(local: phase0.Status, remote: phase0.Status, forkChoice: IForkChoice, slotImportTolerance: number): PeerSyncType;
export declare enum RangeSyncType {
    /** A finalized chain sync should be started with this peer */
    Finalized = "Finalized",
    /** A head chain sync should be started with this peer */
    Head = "Head"
}
export declare const rangeSyncTypes: RangeSyncType[];
/**
 * Check if a peer requires a finalized chain sync. Only if:
 * - The remotes finalized epoch is greater than our current finalized epoch and we have
 *   not seen the finalized hash before
 */
export declare function getRangeSyncType(local: phase0.Status, remote: phase0.Status, forkChoice: IForkChoice): RangeSyncType;
//# sourceMappingURL=remoteSyncType.d.ts.map