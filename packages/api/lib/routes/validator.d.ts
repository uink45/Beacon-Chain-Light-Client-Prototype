import { Json } from "@chainsafe/ssz";
import { ForkName } from "@chainsafe/lodestar-params";
import { allForks, altair, BLSPubkey, BLSSignature, CommitteeIndex, Epoch, Number64, phase0, Root, Slot, ValidatorIndex } from "@chainsafe/lodestar-types";
import { RoutesData, ReturnTypes, ReqSerializers } from "../utils";
export declare type BeaconCommitteeSubscription = {
    validatorIndex: ValidatorIndex;
    committeeIndex: number;
    committeesAtSlot: number;
    slot: Slot;
    isAggregator: boolean;
};
/**
 * From https://github.com/ethereum/eth2.0-APIs/pull/136
 */
export declare type SyncCommitteeSubscription = {
    validatorIndex: ValidatorIndex;
    syncCommitteeIndices: number[];
    untilEpoch: Epoch;
};
export declare type ProposerDuty = {
    slot: Slot;
    validatorIndex: ValidatorIndex;
    pubkey: BLSPubkey;
};
export declare type AttesterDuty = {
    pubkey: BLSPubkey;
    validatorIndex: ValidatorIndex;
    committeeIndex: CommitteeIndex;
    committeeLength: Number64;
    committeesAtSlot: Number64;
    validatorCommitteeIndex: Number64;
    slot: Slot;
};
/**
 * From https://github.com/ethereum/eth2.0-APIs/pull/134
 */
export declare type SyncDuty = {
    pubkey: BLSPubkey;
    /** Index of validator in validator registry. */
    validatorIndex: ValidatorIndex;
    /** The indices of the validator in the sync committee. */
    validatorSyncCommitteeIndices: number[];
};
export declare type Api = {
    /**
     * Get attester duties
     * Requests the beacon node to provide a set of attestation duties, which should be performed by validators, for a particular epoch.
     * Duties should only need to be checked once per epoch, however a chain reorganization (of > MIN_SEED_LOOKAHEAD epochs) could occur, resulting in a change of duties. For full safety, you should monitor head events and confirm the dependent root in this response matches:
     * - event.previous_duty_dependent_root when `compute_epoch_at_slot(event.slot) == epoch`
     * - event.current_duty_dependent_root when `compute_epoch_at_slot(event.slot) + 1 == epoch`
     * - event.block otherwise
     * The dependent_root value is `get_block_root_at_slot(state, compute_start_slot_at_epoch(epoch - 1) - 1)` or the genesis block root in the case of underflow.
     * @param epoch Should only be allowed 1 epoch ahead
     * @param requestBody An array of the validator indices for which to obtain the duties.
     * @returns any Success response
     * @throws ApiError
     */
    getAttesterDuties(epoch: Epoch, validatorIndices: ValidatorIndex[]): Promise<{
        data: AttesterDuty[];
        dependentRoot: Root;
    }>;
    /**
     * Get block proposers duties
     * Request beacon node to provide all validators that are scheduled to propose a block in the given epoch.
     * Duties should only need to be checked once per epoch, however a chain reorganization could occur that results in a change of duties. For full safety, you should monitor head events and confirm the dependent root in this response matches:
     * - event.current_duty_dependent_root when `compute_epoch_at_slot(event.slot) == epoch`
     * - event.block otherwise
     * The dependent_root value is `get_block_root_at_slot(state, compute_start_slot_at_epoch(epoch) - 1)` or the genesis block root in the case of underflow.
     * @param epoch
     * @returns any Success response
     * @throws ApiError
     */
    getProposerDuties(epoch: Epoch): Promise<{
        data: ProposerDuty[];
        dependentRoot: Root;
    }>;
    getSyncCommitteeDuties(epoch: number, validatorIndices: ValidatorIndex[]): Promise<{
        data: SyncDuty[];
        dependentRoot: Root;
    }>;
    /**
     * Produce a new block, without signature.
     * Requests a beacon node to produce a valid block, which can then be signed by a validator.
     * @param slot The slot for which the block should be proposed.
     * @param randaoReveal The validator's randao reveal value.
     * @param graffiti Arbitrary data validator wants to include in block.
     * @returns any Success response
     * @throws ApiError
     */
    produceBlock(slot: Slot, randaoReveal: BLSSignature, graffiti: string): Promise<{
        data: allForks.BeaconBlock;
    }>;
    /**
     * Requests a beacon node to produce a valid block, which can then be signed by a validator.
     * Metadata in the response indicates the type of block produced, and the supported types of block
     * will be added to as forks progress.
     * @param slot The slot for which the block should be proposed.
     * @param randaoReveal The validator's randao reveal value.
     * @param graffiti Arbitrary data validator wants to include in block.
     * @returns any Success response
     * @throws ApiError
     */
    produceBlockV2(slot: Slot, randaoReveal: BLSSignature, graffiti: string): Promise<{
        data: allForks.BeaconBlock;
        version: ForkName;
    }>;
    /**
     * Produce an attestation data
     * Requests that the beacon node produce an AttestationData.
     * @param slot The slot for which an attestation data should be created.
     * @param committeeIndex The committee index for which an attestation data should be created.
     * @returns any Success response
     * @throws ApiError
     */
    produceAttestationData(index: CommitteeIndex, slot: Slot): Promise<{
        data: phase0.AttestationData;
    }>;
    produceSyncCommitteeContribution(slot: Slot, subcommitteeIndex: number, beaconBlockRoot: Root): Promise<{
        data: altair.SyncCommitteeContribution;
    }>;
    /**
     * Get aggregated attestation
     * Aggregates all attestations matching given attestation data root and slot
     * @param attestationDataRoot HashTreeRoot of AttestationData that validator want's aggregated
     * @param slot
     * @returns any Returns aggregated `Attestation` object with same `AttestationData` root.
     * @throws ApiError
     */
    getAggregatedAttestation(attestationDataRoot: Root, slot: Slot): Promise<{
        data: phase0.Attestation;
    }>;
    /**
     * Publish multiple aggregate and proofs
     * Verifies given aggregate and proofs and publishes them on appropriate gossipsub topic.
     * @param requestBody
     * @returns any Successful response
     * @throws ApiError
     */
    publishAggregateAndProofs(signedAggregateAndProofs: phase0.SignedAggregateAndProof[]): Promise<void>;
    publishContributionAndProofs(contributionAndProofs: altair.SignedContributionAndProof[]): Promise<void>;
    /**
     * Signal beacon node to prepare for a committee subnet
     * After beacon node receives this request,
     * search using discv5 for peers related to this subnet
     * and replace current peers with those ones if necessary
     * If validator `is_aggregator`, beacon node must:
     * - announce subnet topic subscription on gossipsub
     * - aggregate attestations received on that subnet
     *
     * @param requestBody
     * @returns any Slot signature is valid and beacon node has prepared the attestation subnet.
     *
     * Note that, we cannot be certain Beacon node will find peers for that subnet for various reasons,"
     *
     * @throws ApiError
     */
    prepareBeaconCommitteeSubnet(subscriptions: BeaconCommitteeSubscription[]): Promise<void>;
    prepareSyncCommitteeSubnets(subscriptions: SyncCommitteeSubscription[]): Promise<void>;
};
/**
 * Define javascript values for each route
 */
export declare const routesData: RoutesData<Api>;
export declare type ReqTypes = {
    getAttesterDuties: {
        params: {
            epoch: Epoch;
        };
        body: ValidatorIndex[];
    };
    getProposerDuties: {
        params: {
            epoch: Epoch;
        };
    };
    getSyncCommitteeDuties: {
        params: {
            epoch: Epoch;
        };
        body: ValidatorIndex[];
    };
    produceBlock: {
        params: {
            slot: number;
        };
        query: {
            randao_reveal: string;
            grafitti: string;
        };
    };
    produceBlockV2: {
        params: {
            slot: number;
        };
        query: {
            randao_reveal: string;
            grafitti: string;
        };
    };
    produceAttestationData: {
        query: {
            slot: number;
            committee_index: number;
        };
    };
    produceSyncCommitteeContribution: {
        query: {
            slot: number;
            subcommittee_index: number;
            beacon_block_root: string;
        };
    };
    getAggregatedAttestation: {
        query: {
            attestation_data_root: string;
            slot: number;
        };
    };
    publishAggregateAndProofs: {
        body: Json;
    };
    publishContributionAndProofs: {
        body: Json;
    };
    prepareBeaconCommitteeSubnet: {
        body: Json;
    };
    prepareSyncCommitteeSubnets: {
        body: Json;
    };
};
export declare function getReqSerializers(): ReqSerializers<Api, ReqTypes>;
export declare function getReturnTypes(): ReturnTypes<Api>;
//# sourceMappingURL=validator.d.ts.map