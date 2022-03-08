import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { phase0 } from "@chainsafe/lodestar-types";
import { RoutesData, ReturnTypes } from "../../utils";
import * as block from "./block";
import * as pool from "./pool";
import * as state from "./state";
export { BlockId, BlockHeaderResponse } from "./block";
export { AttestationFilters } from "./pool";
export { StateId, ValidatorId, ValidatorStatus, ValidatorFilters, CommitteesFilters, FinalityCheckpoints, ValidatorResponse, ValidatorBalance, EpochCommitteeResponse, EpochSyncCommitteeResponse, } from "./state";
export declare type Api = block.Api & pool.Api & state.Api & {
    getGenesis(): Promise<{
        data: phase0.Genesis;
    }>;
};
export declare const routesData: RoutesData<Api>;
export declare type ReqTypes = {
    [K in keyof ReturnType<typeof getReqSerializers>]: ReturnType<ReturnType<typeof getReqSerializers>[K]["writeReq"]>;
};
export declare function getReqSerializers(config: IChainForkConfig): {
    getStateRoot: import("../../utils").ReqSerializer<(stateId: string) => Promise<{
        data: import("@chainsafe/ssz").ByteVector;
    }>, {
        params: {
            stateId: string;
        };
    }>;
    getStateFork: import("../../utils").ReqSerializer<(stateId: string) => Promise<{
        data: phase0.Fork;
    }>, {
        params: {
            stateId: string;
        };
    }>;
    getStateFinalityCheckpoints: import("../../utils").ReqSerializer<(stateId: string) => Promise<{
        data: state.FinalityCheckpoints;
    }>, {
        params: {
            stateId: string;
        };
    }>;
    getStateValidators: import("../../utils").ReqSerializer<(stateId: string, filters?: state.ValidatorFilters | undefined) => Promise<{
        data: state.ValidatorResponse[];
    }>, {
        params: {
            stateId: string;
        };
        query: {
            indices?: state.ValidatorId[] | undefined;
            statuses?: state.ValidatorStatus[] | undefined;
        };
    }>;
    getStateValidator: import("../../utils").ReqSerializer<(stateId: string, validatorId: state.ValidatorId) => Promise<{
        data: state.ValidatorResponse;
    }>, {
        params: {
            stateId: string;
            validatorId: state.ValidatorId;
        };
    }>;
    getStateValidatorBalances: import("../../utils").ReqSerializer<(stateId: string, indices?: state.ValidatorId[] | undefined) => Promise<{
        data: state.ValidatorBalance[];
    }>, {
        params: {
            stateId: string;
        };
        query: {
            indices?: state.ValidatorId[] | undefined;
        };
    }>;
    getEpochCommittees: import("../../utils").ReqSerializer<(stateId: string, filters?: state.CommitteesFilters | undefined) => Promise<{
        data: state.EpochCommitteeResponse[];
    }>, {
        params: {
            stateId: string;
        };
        query: {
            slot?: number | undefined;
            epoch?: number | undefined;
            index?: number | undefined;
        };
    }>;
    getEpochSyncCommittees: import("../../utils").ReqSerializer<(stateId: string, epoch?: number | undefined) => Promise<{
        data: state.EpochSyncCommitteeResponse;
    }>, {
        params: {
            stateId: string;
        };
        query: {
            epoch?: number | undefined;
        };
    }>;
    getPoolAttestations: import("../../utils").ReqSerializer<(filters?: Partial<pool.AttestationFilters> | undefined) => Promise<{
        data: phase0.Attestation[];
    }>, {
        query: {
            slot?: number | undefined;
            committee_index?: number | undefined;
        };
    }>;
    getPoolAttesterSlashings: import("../../utils").ReqSerializer<() => Promise<{
        data: phase0.AttesterSlashing[];
    }>, import("../../utils").ReqGeneric>;
    getPoolProposerSlashings: import("../../utils").ReqSerializer<() => Promise<{
        data: phase0.ProposerSlashing[];
    }>, import("../../utils").ReqGeneric>;
    getPoolVoluntaryExits: import("../../utils").ReqSerializer<() => Promise<{
        data: phase0.SignedVoluntaryExit[];
    }>, import("../../utils").ReqGeneric>;
    submitPoolAttestations: import("../../utils").ReqSerializer<(attestations: phase0.Attestation[]) => Promise<void>, {
        body: import("@chainsafe/ssz").Json;
    }>;
    submitPoolAttesterSlashing: import("../../utils").ReqSerializer<(slashing: phase0.AttesterSlashing) => Promise<void>, {
        body: import("@chainsafe/ssz").Json;
    }>;
    submitPoolProposerSlashing: import("../../utils").ReqSerializer<(slashing: phase0.ProposerSlashing) => Promise<void>, {
        body: import("@chainsafe/ssz").Json;
    }>;
    submitPoolVoluntaryExit: import("../../utils").ReqSerializer<(exit: phase0.SignedVoluntaryExit) => Promise<void>, {
        body: import("@chainsafe/ssz").Json;
    }>;
    submitPoolSyncCommitteeSignatures: import("../../utils").ReqSerializer<(signatures: import("@chainsafe/lodestar-types/lib/altair/types").SyncCommitteeMessage[]) => Promise<void>, {
        body: import("@chainsafe/ssz").Json;
    }>;
    getBlock: import("../../utils").ReqSerializer<(blockId: block.BlockId) => Promise<{
        data: import("@chainsafe/lodestar-types/lib/allForks/types").SignedBeaconBlock;
    }>, {
        params: {
            blockId: string | number;
        };
    }>;
    getBlockV2: import("../../utils").ReqSerializer<(blockId: block.BlockId) => Promise<{
        data: import("@chainsafe/lodestar-types/lib/allForks/types").SignedBeaconBlock;
        version: import("@chainsafe/lodestar-params").ForkName;
    }>, {
        params: {
            blockId: string | number;
        };
    }>;
    getBlockAttestations: import("../../utils").ReqSerializer<(blockId: block.BlockId) => Promise<{
        data: phase0.Attestation[];
    }>, {
        params: {
            blockId: string | number;
        };
    }>;
    getBlockHeader: import("../../utils").ReqSerializer<(blockId: block.BlockId) => Promise<{
        data: block.BlockHeaderResponse;
    }>, {
        params: {
            blockId: string | number;
        };
    }>;
    getBlockHeaders: import("../../utils").ReqSerializer<(filters: Partial<{
        slot: number;
        parentRoot: string;
    }>) => Promise<{
        data: block.BlockHeaderResponse[];
    }>, {
        query: {
            slot?: number | undefined;
            parent_root?: string | undefined;
        };
    }>;
    getBlockRoot: import("../../utils").ReqSerializer<(blockId: block.BlockId) => Promise<{
        data: import("@chainsafe/ssz").ByteVector;
    }>, {
        params: {
            blockId: string | number;
        };
    }>;
    publishBlock: import("../../utils").ReqSerializer<(block: import("@chainsafe/lodestar-types/lib/allForks/types").SignedBeaconBlock) => Promise<void>, {
        body: import("@chainsafe/ssz").Json;
    }>;
    getGenesis: import("../../utils").ReqSerializer<() => void, import("../../utils").ReqGeneric>;
};
export declare function getReturnTypes(): ReturnTypes<Api>;
//# sourceMappingURL=index.d.ts.map