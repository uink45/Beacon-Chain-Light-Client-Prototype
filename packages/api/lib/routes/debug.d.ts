import { ForkName } from "@chainsafe/lodestar-params";
import { allForks, Slot, RootHex } from "@chainsafe/lodestar-types";
import { StateId } from "./beacon/state";
import { ReturnTypes, RoutesData, ReqSerializers, ReqEmpty } from "../utils";
declare type SlotRoot = {
    slot: Slot;
    root: RootHex;
};
export declare type StateFormat = "json" | "ssz";
export declare const mimeTypeSSZ = "application/octet-stream";
export declare type Api = {
    /**
     * Get fork choice leaves
     * Retrieves all possible chain heads (leaves of fork choice tree).
     */
    getHeads(): Promise<{
        data: SlotRoot[];
    }>;
    /**
     * Get full BeaconState object
     * Returns full BeaconState object for given stateId.
     * Depending on `Accept` header it can be returned either as json or as bytes serialized by SSZ
     *
     * @param stateId State identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", "justified", \<slot\>, \<hex encoded stateRoot with 0x prefix\>.
     */
    getState(stateId: StateId, format?: "json"): Promise<{
        data: allForks.BeaconState;
    }>;
    getState(stateId: StateId, format: "ssz"): Promise<Uint8Array>;
    getState(stateId: StateId, format?: StateFormat): Promise<Uint8Array | {
        data: allForks.BeaconState;
    }>;
    /**
     * Get full BeaconState object
     * Returns full BeaconState object for given stateId.
     * Depending on `Accept` header it can be returned either as json or as bytes serialized by SSZ
     *
     * @param stateId State identifier.
     * Can be one of: "head" (canonical head in node's view), "genesis", "finalized", "justified", \<slot\>, \<hex encoded stateRoot with 0x prefix\>.
     */
    getStateV2(stateId: StateId, format?: "json"): Promise<{
        data: allForks.BeaconState;
        version: ForkName;
    }>;
    getStateV2(stateId: StateId, format: "ssz"): Promise<Uint8Array>;
    getStateV2(stateId: StateId, format?: StateFormat): Promise<Uint8Array | {
        data: allForks.BeaconState;
        version: ForkName;
    }>;
    /**
     * NOT IN SPEC
     * Connect to a peer at the given multiaddr array
     */
    connectToPeer(peerIdStr: string, multiaddr: string[]): Promise<void>;
    /**
     * NOT IN SPEC
     * Disconnect from a peer
     */
    disconnectPeer(peerIdStr: string): Promise<void>;
};
export declare const routesData: RoutesData<Api>;
export declare type ReqTypes = {
    getHeads: ReqEmpty;
    getState: {
        params: {
            stateId: string;
        };
        headers: {
            accept?: string;
        };
    };
    getStateV2: {
        params: {
            stateId: string;
        };
        headers: {
            accept?: string;
        };
    };
    connectToPeer: {
        params: {
            peerId: string;
        };
        body: string[];
    };
    disconnectPeer: {
        params: {
            peerId: string;
        };
    };
};
export declare function getReqSerializers(): ReqSerializers<Api, ReqTypes>;
export declare function getReturnTypes(): ReturnTypes<Api>;
export {};
//# sourceMappingURL=debug.d.ts.map