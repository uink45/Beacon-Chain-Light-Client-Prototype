import { Path } from "@chainsafe/ssz";
import { Proof } from "@chainsafe/persistent-merkle-tree";
import { altair, phase0, SyncPeriod } from "@chainsafe/lodestar-types";
import { ReturnTypes, RoutesData, ReqSerializers, ReqEmpty } from "../utils";
import { LightclientHeaderUpdate } from "./events";
export { LightclientHeaderUpdate };
export declare type LightclientSnapshotWithProof = {
    header: phase0.BeaconBlockHeader;
    currentSyncCommittee: altair.SyncCommittee;
    /** Single branch proof from state root to currentSyncCommittee */
    currentSyncCommitteeBranch: Uint8Array[];
};
export declare type Api = {
    /**
     * Returns a multiproof of `paths` at the requested `stateId`.
     * The requested `stateId` may not be available. Regular nodes only keep recent states in memory.
     */
    getStateProof(stateId: string, paths: Path[]): Promise<{
        data: Proof;
    }>;
    /**
     * Returns an array of best updates in the requested periods within the inclusive range `from` - `to`.
     * Best is defined by (in order of priority):
     * - Is finalized update
     * - Has most bits
     * - Oldest update
     */
    getCommitteeUpdates(from: SyncPeriod, to: SyncPeriod): Promise<{
        data: altair.LightClientUpdate[];
    }>;
    /**
     * Returns the latest best head update available. Clients should use the SSE type `lightclient_header_update`
     * unless to get the very first head update after syncing, or if SSE are not supported by the server.
     */
    getHeadUpdate(): Promise<{
        data: LightclientHeaderUpdate;
    }>;
    /**
     * Fetch a snapshot with a proof to a trusted block root.
     * The trusted block root should be fetched with similar means to a weak subjectivity checkpoint.
     * Only block roots for checkpoints are guaranteed to be available.
     */
    getSnapshot(blockRoot: string): Promise<{
        data: LightclientSnapshotWithProof;
    }>;
};
/**
 * Define javascript values for each route
 */
export declare const routesData: RoutesData<Api>;
export declare type ReqTypes = {
    getStateProof: {
        params: {
            stateId: string;
        };
        query: {
            paths: string[];
        };
    };
    getCommitteeUpdates: {
        query: {
            from: number;
            to: number;
        };
    };
    getHeadUpdate: ReqEmpty;
    getSnapshot: {
        params: {
            blockRoot: string;
        };
    };
};
export declare function getReqSerializers(): ReqSerializers<Api, ReqTypes>;
export declare function getReturnTypes(): ReturnTypes<Api>;
//# sourceMappingURL=lightclient.d.ts.map