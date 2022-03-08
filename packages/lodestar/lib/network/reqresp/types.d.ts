import { ForkName } from "@chainsafe/lodestar-params";
import { allForks, phase0, Slot } from "@chainsafe/lodestar-types";
export declare const protocolPrefix = "/eth2/beacon_chain/req";
/** ReqResp protocol names or methods. Each Method can have multiple versions and encodings */
export declare enum Method {
    Status = "status",
    Goodbye = "goodbye",
    Ping = "ping",
    Metadata = "metadata",
    BeaconBlocksByRange = "beacon_blocks_by_range",
    BeaconBlocksByRoot = "beacon_blocks_by_root"
}
/** RPC Versions */
export declare enum Version {
    V1 = "1",
    V2 = "2"
}
/**
 * Available request/response encoding strategies:
 * https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/p2p-interface.md#encoding-strategies
 */
export declare enum Encoding {
    SSZ_SNAPPY = "ssz_snappy"
}
export declare type Protocol = {
    method: Method;
    version: Version;
    encoding: Encoding;
};
export declare const protocolsSupported: [Method, Version, Encoding][];
export declare const isSingleResponseChunkByMethod: {
    [K in Method]: boolean;
};
/** Deserialize some types to TreeBacked directly for more efficient hashing */
export declare const deserializeToTreeByMethod: {
    [K in Method]: boolean;
};
export declare const CONTEXT_BYTES_FORK_DIGEST_LENGTH = 4;
export declare enum ContextBytesType {
    /** 0 bytes chunk, can be ignored */
    Empty = 0,
    /** A fixed-width 4 byte <context-bytes>, set to the ForkDigest matching the chunk: compute_fork_digest(fork_version, genesis_validators_root) */
    ForkDigest = 1
}
/** Meaning of the <context-bytes> chunk per protocol */
export declare function contextBytesTypeByProtocol(protocol: Protocol): ContextBytesType;
/** Request SSZ type for each method and ForkName */
export declare function getRequestSzzTypeByMethod(method: Method): import("@chainsafe/ssz").BigIntUintType | import("@chainsafe/ssz").ListType<import("@chainsafe/ssz").List<any>> | import("@chainsafe/ssz").ContainerType<phase0.Status> | import("@chainsafe/ssz").ContainerType<phase0.BeaconBlocksByRangeRequest> | null;
export declare type RequestBodyByMethod = {
    [Method.Status]: phase0.Status;
    [Method.Goodbye]: phase0.Goodbye;
    [Method.Ping]: phase0.Ping;
    [Method.Metadata]: null;
    [Method.BeaconBlocksByRange]: phase0.BeaconBlocksByRangeRequest;
    [Method.BeaconBlocksByRoot]: phase0.BeaconBlocksByRootRequest;
};
/** Response SSZ type for each method and ForkName */
export declare function getResponseSzzTypeByMethod(protocol: Protocol, forkName: ForkName): import("@chainsafe/ssz").BigIntUintType | import("@chainsafe/ssz").ContainerType<phase0.SignedBeaconBlock> | import("@chainsafe/ssz").ContainerType<phase0.Status> | import("@chainsafe/ssz").ContainerType<phase0.Metadata> | import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/altair").Metadata> | import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/altair").SignedBeaconBlock> | import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/bellatrix").SignedBeaconBlock>;
/** Return either an ssz type or the serializer for ReqRespBlockResponse */
export declare function getOutgoingSerializerByMethod(protocol: Protocol): OutgoingSerializer;
declare type CommonResponseBodyByMethod = {
    [Method.Status]: phase0.Status;
    [Method.Goodbye]: phase0.Goodbye;
    [Method.Ping]: phase0.Ping;
    [Method.Metadata]: phase0.Metadata;
};
export declare type OutgoingResponseBodyByMethod = CommonResponseBodyByMethod & {
    [Method.BeaconBlocksByRange]: ReqRespBlockResponse;
    [Method.BeaconBlocksByRoot]: ReqRespBlockResponse;
};
export declare type IncomingResponseBodyByMethod = CommonResponseBodyByMethod & {
    [Method.BeaconBlocksByRange]: allForks.SignedBeaconBlock;
    [Method.BeaconBlocksByRoot]: allForks.SignedBeaconBlock;
};
export declare type RequestBody = RequestBodyByMethod[Method];
export declare type OutgoingResponseBody = OutgoingResponseBodyByMethod[Method];
export declare type IncomingResponseBody = IncomingResponseBodyByMethod[Method];
export declare type RequestOrIncomingResponseBody = RequestBody | IncomingResponseBody;
export declare type RequestOrOutgoingResponseBody = RequestBody | OutgoingResponseBody;
export declare type RequestType = Exclude<ReturnType<typeof getRequestSzzTypeByMethod>, null>;
export declare type ResponseType = ReturnType<typeof getResponseSzzTypeByMethod>;
export declare type RequestOrResponseType = RequestType | ResponseType;
export declare type OutgoingSerializer = {
    serialize: (body: any) => Uint8Array;
};
export declare type RequestTypedContainer = {
    [K in Method]: {
        method: K;
        body: RequestBodyByMethod[K];
    };
}[Method];
export declare type ResponseTypedContainer = {
    [K in Method]: {
        method: K;
        body: OutgoingResponseBodyByMethod[K];
    };
}[Method];
/** Serializer for ReqRespBlockResponse */
export declare const reqRespBlockResponseSerializer: {
    serialize: (chunk: ReqRespBlockResponse) => Uint8Array;
};
/** This type helps response to beacon_block_by_range and beacon_block_by_root more efficiently */
export declare type ReqRespBlockResponse = {
    /** Deserialized data of allForks.SignedBeaconBlock */
    bytes: Uint8Array;
    slot: Slot;
};
export {};
//# sourceMappingURL=types.d.ts.map