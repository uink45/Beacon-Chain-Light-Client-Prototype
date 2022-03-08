import { Epoch, Root, Slot } from "@chainsafe/lodestar-types";
import { IProtoBlock } from "@chainsafe/lodestar-fork-choice";
import { phase0, CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { IBeaconChain } from "..";
export declare function validateGossipAttestation(chain: IBeaconChain, attestation: phase0.Attestation, 
/** Optional, to allow verifying attestations through API with unknown subnet */
subnet: number | null): Promise<{
    indexedAttestation: phase0.IndexedAttestation;
    subnet: number;
}>;
/**
 * Verify that the `attestation` is within the acceptable gossip propagation range, with reference
 * to the current slot of the `chain`.
 *
 * Accounts for `MAXIMUM_GOSSIP_CLOCK_DISPARITY`.
 * Note: We do not queue future attestations for later processing
 */
export declare function verifyPropagationSlotRange(chain: IBeaconChain, attestationSlot: Slot): void;
/**
 * Verify:
 * 1. head block is known
 * 2. attestation's target block is an ancestor of the block named in the LMD vote
 */
export declare function verifyHeadBlockAndTargetRoot(chain: IBeaconChain, beaconBlockRoot: Root, targetRoot: Root, attestationEpoch: Epoch): IProtoBlock;
export declare function getCommitteeIndices(attestationTargetState: CachedBeaconStateAllForks, attestationSlot: Slot, attestationIndex: number): number[];
/**
 * Compute the correct subnet for a slot/committee index
 */
export declare function computeSubnetForSlot(state: CachedBeaconStateAllForks, slot: number, committeeIndex: number): number;
//# sourceMappingURL=attestation.d.ts.map