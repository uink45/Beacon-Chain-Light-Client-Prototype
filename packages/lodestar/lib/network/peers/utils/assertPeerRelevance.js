"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderIrrelevantPeerType = exports.isZeroRoot = exports.assertPeerRelevance = exports.IrrelevantPeerCode = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
const constants_1 = require("../../../constants");
// TODO: Why this value? (From Lighthouse)
const FUTURE_SLOT_TOLERANCE = 1;
var IrrelevantPeerCode;
(function (IrrelevantPeerCode) {
    IrrelevantPeerCode["INCOMPATIBLE_FORKS"] = "IRRELEVANT_PEER_INCOMPATIBLE_FORKS";
    IrrelevantPeerCode["DIFFERENT_CLOCKS"] = "IRRELEVANT_PEER_DIFFERENT_CLOCKS";
    IrrelevantPeerCode["GENESIS_NONZERO"] = "IRRELEVANT_PEER_GENESIS_NONZERO";
    IrrelevantPeerCode["DIFFERENT_FINALIZED"] = "IRRELEVANT_PEER_DIFFERENT_FINALIZED";
})(IrrelevantPeerCode = exports.IrrelevantPeerCode || (exports.IrrelevantPeerCode = {}));
/**
 * Process a `Status` message to determine if a peer is relevant to us. If the peer is
 * irrelevant the reason is returned.
 */
function assertPeerRelevance(remote, chain) {
    const local = chain.getStatus();
    // The node is on a different network/fork
    if (!lodestar_types_1.ssz.ForkDigest.equals(local.forkDigest, remote.forkDigest)) {
        return {
            code: IrrelevantPeerCode.INCOMPATIBLE_FORKS,
            ours: local.forkDigest,
            theirs: remote.forkDigest,
        };
    }
    // The remote's head is on a slot that is significantly ahead of what we consider the
    // current slot. This could be because they are using a different genesis time, or that
    // their or our system's clock is incorrect.
    const slotDiff = remote.headSlot - Math.max(chain.clock.currentSlot, 0);
    if (slotDiff > FUTURE_SLOT_TOLERANCE) {
        return { code: IrrelevantPeerCode.DIFFERENT_CLOCKS, slotDiff };
    }
    // TODO: Is this check necessary?
    if (remote.finalizedEpoch === constants_1.GENESIS_EPOCH && !isZeroRoot(remote.finalizedRoot)) {
        return {
            code: IrrelevantPeerCode.GENESIS_NONZERO,
            root: remote.finalizedRoot,
        };
    }
    // The remote's finalized epoch is less than or equal to ours, but the block root is
    // different to the one in our chain. Therefore, the node is on a different chain and we
    // should not communicate with them.
    if (remote.finalizedEpoch <= local.finalizedEpoch &&
        !isZeroRoot(remote.finalizedRoot) &&
        !isZeroRoot(local.finalizedRoot)) {
        const remoteRoot = remote.finalizedRoot;
        const expectedRoot = remote.finalizedEpoch === local.finalizedEpoch
            ? local.finalizedRoot
            : // This will get the latest known block at the start of the epoch.
                getRootAtHistoricalEpoch(chain, remote.finalizedEpoch);
        if (expectedRoot !== null && !lodestar_types_1.ssz.Root.equals(remoteRoot, expectedRoot)) {
            return {
                code: IrrelevantPeerCode.DIFFERENT_FINALIZED,
                expectedRoot: expectedRoot,
                remoteRoot: remoteRoot,
            };
        }
    }
    // Note: Accept request status finalized checkpoint in the future, we do not know if it is a true finalized root
    return null;
}
exports.assertPeerRelevance = assertPeerRelevance;
function isZeroRoot(root) {
    const ZERO_ROOT = lodestar_types_1.ssz.Root.defaultValue();
    return lodestar_types_1.ssz.Root.equals(root, ZERO_ROOT);
}
exports.isZeroRoot = isZeroRoot;
function getRootAtHistoricalEpoch(chain, epoch) {
    const headState = chain.getHeadState();
    const slot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(epoch);
    if (slot < headState.slot - lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT) {
        // TODO: If the slot is very old, go to the historical blocks DB and fetch the block with less or equal `slot`.
        // Note that our db schema will have to be updated to persist the block root to prevent re-hashing.
        // For now peers will be accepted, since it's better than throwing an error on `getBlockRootAtSlot()`
        return null;
    }
    // This will get the latest known block at the start of the epoch.
    // NOTE: Throws if the epoch if from a long-ago epoch
    return (0, lodestar_beacon_state_transition_1.getBlockRootAtSlot)(headState, slot);
    // NOTE: Previous code tolerated long-ago epochs
    // ^^^^
    // finalized checkpoint of status is from an old long-ago epoch.
    // We need to ask the chain for most recent canonical block at the finalized checkpoint start slot.
    // The problem is that the slot may be a skip slot.
    // And the block root may be from multiple epochs back even.
    // The epoch in the checkpoint is there to checkpoint the tail end of skip slots, even if there is no block.
    // TODO: accepted for now. Need to maintain either a list of finalized block roots,
    // or inefficiently loop from finalized slot backwards, until we find the block we need to check against.
}
function renderIrrelevantPeerType(type) {
    switch (type.code) {
        case IrrelevantPeerCode.INCOMPATIBLE_FORKS:
            return `INCOMPATIBLE_FORKS ours: ${(0, ssz_1.toHexString)(type.ours)} theirs: ${(0, ssz_1.toHexString)(type.theirs)}`;
        case IrrelevantPeerCode.DIFFERENT_CLOCKS:
            return `DIFFERENT_CLOCKS slotDiff: ${type.slotDiff}`;
        case IrrelevantPeerCode.GENESIS_NONZERO:
            return `GENESIS_NONZERO: ${(0, ssz_1.toHexString)(type.root)}`;
        case IrrelevantPeerCode.DIFFERENT_FINALIZED:
            return `DIFFERENT_FINALIZED root: ${(0, ssz_1.toHexString)(type.remoteRoot)} expected: ${(0, ssz_1.toHexString)(type.expectedRoot)}`;
    }
}
exports.renderIrrelevantPeerType = renderIrrelevantPeerType;
//# sourceMappingURL=assertPeerRelevance.js.map