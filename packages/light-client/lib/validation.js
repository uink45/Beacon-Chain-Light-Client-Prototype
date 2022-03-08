"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidSignedHeader = exports.activeHeader = exports.assertValidSyncCommitteeProof = exports.assertValidFinalityProof = exports.assertValidLightClientUpdate = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const bls_1 = require("@chainsafe/bls");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const verifyMerkleBranch_1 = require("./utils/verifyMerkleBranch");
const utils_1 = require("./utils/utils");
const clock_1 = require("./utils/clock");
/**
 *
 * @param syncCommittee SyncPeriod that signed this update: `computeSyncPeriodAtSlot(update.header.slot) - 1`
 * @param forkVersion ForkVersion that was used to sign the update
 */
function assertValidLightClientUpdate(config, syncCommittee, update) {
    // DIFF FROM SPEC: An update with the same header.slot can be valid and valuable to the lightclient
    // It may have more consensus and result in a better snapshot whilst not advancing the state
    // ----
    // Verify update slot is larger than snapshot slot
    // if (update.header.slot <= snapshot.header.slot) {
    //   throw Error("update slot is less or equal snapshot slot");
    // }
    // Verify update header root is the finalized root of the finality header, if specified
    const isFinalized = !(0, utils_1.isEmptyHeader)(update.finalizedHeader);
    if (isFinalized) {
        assertValidFinalityProof(update);
    }
    else {
        (0, utils_1.assertZeroHashes)(update.finalityBranch, lodestar_params_1.FINALIZED_ROOT_DEPTH, "finalityBranches");
    }
    // DIFF FROM SPEC:
    // The nextSyncCommitteeBranch should be check always not only when updatePeriodIncremented
    // An update may not increase the period but still be stored in validUpdates and be used latter
    assertValidSyncCommitteeProof(update);
    const { attestedHeader } = update;
    const headerBlockRoot = lodestar_types_1.ssz.phase0.BeaconBlockHeader.hashTreeRoot(attestedHeader);
    assertValidSignedHeader(config, syncCommittee, update.syncAggregate, headerBlockRoot, attestedHeader.slot);
}
exports.assertValidLightClientUpdate = assertValidLightClientUpdate;
/**
 * Proof that the state referenced in `update.finalityHeader.stateRoot` includes
 * ```ts
 * state = {
 *   finalizedCheckpoint: {
 *     root: update.header
 *   }
 * }
 * ```
 *
 * Where `hashTreeRoot(state) == update.finalityHeader.stateRoot`
 */
function assertValidFinalityProof(update) {
    if (!(0, verifyMerkleBranch_1.isValidMerkleBranch)(lodestar_types_1.ssz.phase0.BeaconBlockHeader.hashTreeRoot(update.finalizedHeader), Array.from(update.finalityBranch).map((i) => i.valueOf()), lodestar_params_1.FINALIZED_ROOT_DEPTH, lodestar_params_1.FINALIZED_ROOT_INDEX, update.attestedHeader.stateRoot.valueOf())) {
        throw Error("Invalid finality header merkle branch");
    }
    const updatePeriod = (0, clock_1.computeSyncPeriodAtSlot)(update.attestedHeader.slot);
    const updateFinalityPeriod = (0, clock_1.computeSyncPeriodAtSlot)(update.finalizedHeader.slot);
    if (updateFinalityPeriod !== updatePeriod) {
        throw Error(`finalityHeader period ${updateFinalityPeriod} != header period ${updatePeriod}`);
    }
}
exports.assertValidFinalityProof = assertValidFinalityProof;
/**
 * Proof that the state referenced in `update.header.stateRoot` includes
 * ```ts
 * state = {
 *   nextSyncCommittee: update.nextSyncCommittee
 * }
 * ```
 *
 * Where `hashTreeRoot(state) == update.header.stateRoot`
 */
function assertValidSyncCommitteeProof(update) {
    if (!(0, verifyMerkleBranch_1.isValidMerkleBranch)(lodestar_types_1.ssz.altair.SyncCommittee.hashTreeRoot(update.nextSyncCommittee), Array.from(update.nextSyncCommitteeBranch).map((i) => i.valueOf()), lodestar_params_1.NEXT_SYNC_COMMITTEE_DEPTH, lodestar_params_1.NEXT_SYNC_COMMITTEE_INDEX, activeHeader(update).stateRoot.valueOf())) {
        throw Error("Invalid next sync committee merkle branch");
    }
}
exports.assertValidSyncCommitteeProof = assertValidSyncCommitteeProof;
/**
 * The "active header" is the header that the update is trying to convince us
 * to accept. If a finalized header is present, it's the finalized header,
 * otherwise it's the attested header
 * @param update
 */
function activeHeader(update) {
    if (!(0, utils_1.isEmptyHeader)(update.finalizedHeader)) {
        return update.finalizedHeader;
    }
    return update.attestedHeader;
}
exports.activeHeader = activeHeader;
/**
 * Assert valid signature for `signedHeader` with provided `syncCommittee`.
 *
 * update.syncCommitteeSignature signs over the block at the previous slot of the state it is included.
 * ```py
 * previous_slot = max(state.slot, Slot(1)) - Slot(1)
 * domain = get_domain(state, DOMAIN_SYNC_COMMITTEE, compute_epoch_at_slot(previous_slot))
 * signing_root = compute_signing_root(get_block_root_at_slot(state, previous_slot), domain)
 * ```
 * Ref: https://github.com/ethereum/eth2.0-specs/blob/dev/specs/altair/beacon-chain.md#sync-committee-processing
 *
 * @param syncCommittee SyncPeriod that signed this update: `computeSyncPeriodAtSlot(update.header.slot) - 1`
 * @param forkVersion ForkVersion that was used to sign the update
 * @param signedHeaderRoot Takes header root instead of the head itself to prevent re-hashing on SSE
 */
function assertValidSignedHeader(config, syncCommittee, syncAggregate, signedHeaderRoot, signedHeaderSlot) {
    const participantPubkeys = (0, utils_1.getParticipantPubkeys)(syncCommittee.pubkeys, syncAggregate.syncCommitteeBits);
    // Verify sync committee has sufficient participants.
    // SyncAggregates included in blocks may have zero participants
    if (participantPubkeys.length < lodestar_params_1.MIN_SYNC_COMMITTEE_PARTICIPANTS) {
        throw Error("Sync committee has not sufficient participants");
    }
    const signingRoot = lodestar_types_1.ssz.phase0.SigningData.hashTreeRoot({
        objectRoot: signedHeaderRoot,
        domain: config.getDomain(lodestar_params_1.DOMAIN_SYNC_COMMITTEE, signedHeaderSlot),
    });
    if (!isValidBlsAggregate(participantPubkeys, signingRoot, syncAggregate.syncCommitteeSignature.valueOf())) {
        throw Error("Invalid aggregate signature");
    }
}
exports.assertValidSignedHeader = assertValidSignedHeader;
/**
 * Same as BLS.verifyAggregate but with detailed error messages
 */
function isValidBlsAggregate(publicKeys, message, signature) {
    let aggPubkey;
    try {
        aggPubkey = bls_1.PublicKey.aggregate(publicKeys);
    }
    catch (e) {
        e.message = `Error aggregating pubkeys: ${e.message}`;
        throw e;
    }
    let sig;
    try {
        sig = bls_1.Signature.fromBytes(signature, undefined, true);
    }
    catch (e) {
        e.message = `Error deserializing signature: ${e.message}`;
        throw e;
    }
    try {
        return sig.verify(aggPubkey, message);
    }
    catch (e) {
        e.message = `Error verifying signature: ${e.message}`;
        throw e;
    }
}
//# sourceMappingURL=validation.js.map