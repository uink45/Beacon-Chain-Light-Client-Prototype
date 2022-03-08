import { phase0, altair, CommitteeIndex, Slot } from "@chainsafe/lodestar-types";
import { Json } from "@chainsafe/ssz";
import { RoutesData, ReturnTypes, ReqSerializers, ReqEmpty } from "../../utils";
export declare type AttestationFilters = {
    slot: Slot;
    committeeIndex: CommitteeIndex;
};
export declare type Api = {
    /**
     * Get Attestations from operations pool
     * Retrieves attestations known by the node but not necessarily incorporated into any block
     * @param slot
     * @param committeeIndex
     * @returns any Successful response
     * @throws ApiError
     */
    getPoolAttestations(filters?: Partial<AttestationFilters>): Promise<{
        data: phase0.Attestation[];
    }>;
    /**
     * Get AttesterSlashings from operations pool
     * Retrieves attester slashings known by the node but not necessarily incorporated into any block
     * @returns any Successful response
     * @throws ApiError
     */
    getPoolAttesterSlashings(): Promise<{
        data: phase0.AttesterSlashing[];
    }>;
    /**
     * Get ProposerSlashings from operations pool
     * Retrieves proposer slashings known by the node but not necessarily incorporated into any block
     * @returns any Successful response
     * @throws ApiError
     */
    getPoolProposerSlashings(): Promise<{
        data: phase0.ProposerSlashing[];
    }>;
    /**
     * Get SignedVoluntaryExit from operations pool
     * Retrieves voluntary exits known by the node but not necessarily incorporated into any block
     * @returns any Successful response
     * @throws ApiError
     */
    getPoolVoluntaryExits(): Promise<{
        data: phase0.SignedVoluntaryExit[];
    }>;
    /**
     * Submit Attestation objects to node
     * Submits Attestation objects to the node.  Each attestation in the request body is processed individually.
     *
     * If an attestation is validated successfully the node MUST publish that attestation on the appropriate subnet.
     *
     * If one or more attestations fail validation the node MUST return a 400 error with details of which attestations have failed, and why.
     *
     * @param requestBody
     * @returns any Attestations are stored in pool and broadcast on appropriate subnet
     * @throws ApiError
     */
    submitPoolAttestations(attestations: phase0.Attestation[]): Promise<void>;
    /**
     * Submit AttesterSlashing object to node's pool
     * Submits AttesterSlashing object to node's pool and if passes validation node MUST broadcast it to network.
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    submitPoolAttesterSlashing(slashing: phase0.AttesterSlashing): Promise<void>;
    /**
     * Submit ProposerSlashing object to node's pool
     * Submits ProposerSlashing object to node's pool and if passes validation  node MUST broadcast it to network.
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    submitPoolProposerSlashing(slashing: phase0.ProposerSlashing): Promise<void>;
    /**
     * Submit SignedVoluntaryExit object to node's pool
     * Submits SignedVoluntaryExit object to node's pool and if passes validation node MUST broadcast it to network.
     * @param requestBody
     * @returns any Voluntary exit is stored in node and broadcasted to network
     * @throws ApiError
     */
    submitPoolVoluntaryExit(exit: phase0.SignedVoluntaryExit): Promise<void>;
    /**
     * TODO: Add description
     */
    submitPoolSyncCommitteeSignatures(signatures: altair.SyncCommitteeMessage[]): Promise<void>;
};
/**
 * Define javascript values for each route
 */
export declare const routesData: RoutesData<Api>;
export declare type ReqTypes = {
    getPoolAttestations: {
        query: {
            slot?: number;
            committee_index?: number;
        };
    };
    getPoolAttesterSlashings: ReqEmpty;
    getPoolProposerSlashings: ReqEmpty;
    getPoolVoluntaryExits: ReqEmpty;
    submitPoolAttestations: {
        body: Json;
    };
    submitPoolAttesterSlashing: {
        body: Json;
    };
    submitPoolProposerSlashing: {
        body: Json;
    };
    submitPoolVoluntaryExit: {
        body: Json;
    };
    submitPoolSyncCommitteeSignatures: {
        body: Json;
    };
};
export declare function getReqSerializers(): ReqSerializers<Api, ReqTypes>;
export declare function getReturnTypes(): ReturnTypes<Api>;
//# sourceMappingURL=pool.d.ts.map