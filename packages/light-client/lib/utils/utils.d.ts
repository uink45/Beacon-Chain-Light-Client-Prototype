import { altair, Root } from "@chainsafe/lodestar-types";
import { BeaconBlockHeader } from "@chainsafe/lodestar-types/phase0";
import { ArrayLike, BitVector } from "@chainsafe/ssz";
import { SyncCommitteeFast } from "../types";
export declare function sumBits(bits: ArrayLike<boolean>): number;
export declare function isZeroHash(root: Root): boolean;
export declare function assertZeroHashes(rootArray: ArrayLike<Root>, expectedLength: number, errorMessage: string): void;
/**
 * Util to guarantee that all bits have a corresponding pubkey
 */
export declare function getParticipantPubkeys<T>(pubkeys: ArrayLike<T>, bits: BitVector): T[];
export declare function toBlockHeader(block: altair.BeaconBlock): BeaconBlockHeader;
export declare function deserializeSyncCommittee(syncCommittee: altair.SyncCommittee): SyncCommitteeFast;
export declare function serializeSyncCommittee(syncCommittee: SyncCommitteeFast): altair.SyncCommittee;
export declare function isEmptyHeader(header: BeaconBlockHeader): boolean;
//# sourceMappingURL=utils.d.ts.map