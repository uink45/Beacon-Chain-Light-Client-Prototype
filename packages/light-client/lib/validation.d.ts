import { altair, phase0, Root, Slot } from "@chainsafe/lodestar-types";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { SyncCommitteeFast } from "./types";
/**
 *
 * @param syncCommittee SyncPeriod that signed this update: `computeSyncPeriodAtSlot(update.header.slot) - 1`
 * @param forkVersion ForkVersion that was used to sign the update
 */
export declare function assertValidLightClientUpdate(config: IBeaconConfig, syncCommittee: SyncCommitteeFast, update: altair.LightClientUpdate): void;
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
export declare function assertValidFinalityProof(update: altair.LightClientUpdate): void;
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
export declare function assertValidSyncCommitteeProof(update: altair.LightClientUpdate): void;
/**
 * The "active header" is the header that the update is trying to convince us
 * to accept. If a finalized header is present, it's the finalized header,
 * otherwise it's the attested header
 * @param update
 */
export declare function activeHeader(update: altair.LightClientUpdate): phase0.BeaconBlockHeader;
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
export declare function assertValidSignedHeader(config: IBeaconConfig, syncCommittee: SyncCommitteeFast, syncAggregate: altair.SyncAggregate, signedHeaderRoot: Root, signedHeaderSlot: Slot): void;
//# sourceMappingURL=validation.d.ts.map