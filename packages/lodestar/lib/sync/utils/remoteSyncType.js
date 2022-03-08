"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRangeSyncType = exports.rangeSyncTypes = exports.RangeSyncType = exports.getPeerSyncType = exports.peerSyncTypes = exports.PeerSyncType = void 0;
/** The type of peer relative to our current state */
var PeerSyncType;
(function (PeerSyncType) {
    /** The peer is on our chain and is fully synced with respect to our chain */
    PeerSyncType["FullySynced"] = "FullySynced";
    /** The peer has a greater knowledge of the chain than us that warrants a full sync */
    PeerSyncType["Advanced"] = "Advanced";
    /** A peer is behind in the sync and not useful to us for downloading blocks */
    PeerSyncType["Behind"] = "Behind";
})(PeerSyncType = exports.PeerSyncType || (exports.PeerSyncType = {}));
// Cache Object.keys iteration for faster loops in metrics
exports.peerSyncTypes = Object.keys(PeerSyncType);
function getPeerSyncType(local, remote, forkChoice, slotImportTolerance) {
    // Aux vars: Inclusive boundaries of the range to consider a peer's head synced to ours.
    const nearRangeStart = local.headSlot - slotImportTolerance;
    const nearRangeEnd = local.headSlot + slotImportTolerance;
    if (remote.finalizedEpoch < local.finalizedEpoch) {
        // The node has a lower finalized epoch, their chain is not useful to us. There are two
        // cases where a node can have a lower finalized epoch:
        //
        // ## The node is on the same chain
        //
        // If a node is on the same chain but has a lower finalized epoch, their head must be
        // lower than ours. Therefore, we have nothing to request from them.
        //
        // ## The node is on a fork
        //
        // If a node is on a fork that has a lower finalized epoch, switching to that fork would
        // cause us to revert a finalized block. This is not permitted, therefore we have no
        // interest in their blocks.
        //
        // We keep these peers to allow them to sync from us.
        return PeerSyncType.Behind;
    }
    else if (remote.finalizedEpoch > local.finalizedEpoch) {
        if ((local.finalizedEpoch + 1 == remote.finalizedEpoch &&
            nearRangeStart <= remote.headSlot &&
            remote.headSlot <= nearRangeEnd) ||
            forkChoice.hasBlock(remote.headRoot)) {
            // This peer is near enough to be considered synced, or we have already synced up to its head
            return PeerSyncType.FullySynced;
        }
        else {
            return PeerSyncType.Advanced;
        }
    }
    else {
        // NOTE: if a peer has our same `finalizedEpoch` with a different `finalized_root`
        // they are not considered relevant and won't be propagated to sync.
        // Check if the peer is the peer is inside the tolerance range to be considered synced.
        if (remote.headSlot < nearRangeStart) {
            return PeerSyncType.Behind;
        }
        else if (remote.headSlot > nearRangeEnd && !forkChoice.hasBlock(remote.headRoot)) {
            // This peer has a head ahead enough of ours and we have no knowledge of their best block.
            return PeerSyncType.Advanced;
        }
        else {
            // This peer is either in the tolerance range, or ahead us with an already rejected block.
            return PeerSyncType.FullySynced;
        }
    }
}
exports.getPeerSyncType = getPeerSyncType;
var RangeSyncType;
(function (RangeSyncType) {
    /** A finalized chain sync should be started with this peer */
    RangeSyncType["Finalized"] = "Finalized";
    /** A head chain sync should be started with this peer */
    RangeSyncType["Head"] = "Head";
})(RangeSyncType = exports.RangeSyncType || (exports.RangeSyncType = {}));
// Cache Object.keys iteration for faster loops in metrics
exports.rangeSyncTypes = Object.keys(RangeSyncType);
/**
 * Check if a peer requires a finalized chain sync. Only if:
 * - The remotes finalized epoch is greater than our current finalized epoch and we have
 *   not seen the finalized hash before
 */
function getRangeSyncType(local, remote, forkChoice) {
    if (remote.finalizedEpoch > local.finalizedEpoch && !forkChoice.hasBlock(remote.finalizedRoot)) {
        return RangeSyncType.Finalized;
    }
    else {
        return RangeSyncType.Head;
    }
}
exports.getRangeSyncType = getRangeSyncType;
//# sourceMappingURL=remoteSyncType.js.map