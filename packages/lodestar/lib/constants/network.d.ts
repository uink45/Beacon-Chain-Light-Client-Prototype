/**
 * For more info on some of these constants:
 * https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/p2p-interface.md#configuration
 */
/**
 * The maximum number of slots during which an attestation can be propagated.
 */
export declare const ATTESTATION_PROPAGATION_SLOT_RANGE = 23;
export declare enum RespStatus {
    /**
     * A normal response follows, with contents matching the expected message schema and encoding specified in the request
     */
    SUCCESS = 0,
    /**
     * The contents of the request are semantically invalid, or the payload is malformed,
     * or could not be understood. The response payload adheres to the ErrorMessage schema
     */
    INVALID_REQUEST = 1,
    /**
     * The responder encountered an error while processing the request. The response payload adheres to the ErrorMessage schema
     */
    SERVER_ERROR = 2,
    /**
     * The responder does not have requested resource.  The response payload adheres to the ErrorMessage schema (described below). Note: This response code is only valid as a response to BlocksByRange
     */
    RESOURCE_UNAVAILABLE = 3,
    /**
     * Our node does not have bandwidth to serve requests due to either per-peer quota or total quota.
     */
    RATE_LIMITED = 139
}
export declare type RpcResponseStatusError = Exclude<RespStatus, RespStatus.SUCCESS>;
/** The maximum allowed size of uncompressed gossip messages. */
export declare const GOSSIP_MAX_SIZE: number;
/** The maximum allowed size of uncompressed req/resp chunked responses. */
export declare const MAX_CHUNK_SIZE: number;
/** The maximum time to wait for first byte of request response (time-to-first-byte). */
export declare const TTFB_TIMEOUT: number;
/** The maximum time for complete response transfer. */
export declare const RESP_TIMEOUT: number;
/** Non-spec timeout from sending request until write stream closed by responder */
export declare const REQUEST_TIMEOUT: number;
/** Non-spec timeout from dialing protocol until stream opened */
export declare const DIAL_TIMEOUT: number;
export declare const timeoutOptions: {
    TTFB_TIMEOUT: number;
    RESP_TIMEOUT: number;
    REQUEST_TIMEOUT: number;
    DIAL_TIMEOUT: number;
};
export declare enum GoodByeReasonCode {
    CLIENT_SHUTDOWN = 1,
    IRRELEVANT_NETWORK = 2,
    ERROR = 3,
    TOO_MANY_PEERS = 129,
    SCORE_TOO_LOW = 250,
    BANNED = 251
}
export declare const GOODBYE_KNOWN_CODES: Record<string, string>;
/** Until js-libp2p types its events */
export declare enum Libp2pEvent {
    peerConnect = "peer:connect",
    peerDisconnect = "peer:disconnect"
}
//# sourceMappingURL=network.d.ts.map