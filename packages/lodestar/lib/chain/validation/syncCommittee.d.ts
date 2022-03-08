import { CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { altair } from "@chainsafe/lodestar-types";
import { IBeaconChain } from "../interface";
declare type IndexInSubcommittee = number;
/**
 * Spec v1.1.0-alpha.8
 */
export declare function validateGossipSyncCommittee(chain: IBeaconChain, syncCommittee: altair.SyncCommitteeMessage, subnet: number): Promise<{
    indexInSubcommittee: IndexInSubcommittee;
}>;
/**
 * Abstracted so it can be re-used in API validation.
 */
export declare function validateSyncCommitteeSigOnly(chain: IBeaconChain, headState: CachedBeaconStateAllForks, syncCommittee: altair.SyncCommitteeMessage): Promise<void>;
/**
 * Spec v1.1.0-alpha.8
 */
export declare function validateGossipSyncCommitteeExceptSig(chain: IBeaconChain, headState: CachedBeaconStateAllForks, subnet: number, data: Pick<altair.SyncCommitteeMessage, "slot" | "validatorIndex">): IndexInSubcommittee;
export {};
//# sourceMappingURL=syncCommittee.d.ts.map