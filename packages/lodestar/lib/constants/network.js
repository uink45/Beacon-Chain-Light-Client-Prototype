"use strict";
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Libp2pEvent = exports.GOODBYE_KNOWN_CODES = exports.GoodByeReasonCode = exports.timeoutOptions = exports.DIAL_TIMEOUT = exports.REQUEST_TIMEOUT = exports.RESP_TIMEOUT = exports.TTFB_TIMEOUT = exports.MAX_CHUNK_SIZE = exports.GOSSIP_MAX_SIZE = exports.RespStatus = exports.ATTESTATION_PROPAGATION_SLOT_RANGE = void 0;
/**
 * For more info on some of these constants:
 * https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/p2p-interface.md#configuration
 */
// Gossip constants
/**
 * The maximum number of slots during which an attestation can be propagated.
 */
exports.ATTESTATION_PROPAGATION_SLOT_RANGE = 23;
//  Request/Response constants
var RespStatus;
(function (RespStatus) {
    /**
     * A normal response follows, with contents matching the expected message schema and encoding specified in the request
     */
    RespStatus[RespStatus["SUCCESS"] = 0] = "SUCCESS";
    /**
     * The contents of the request are semantically invalid, or the payload is malformed,
     * or could not be understood. The response payload adheres to the ErrorMessage schema
     */
    RespStatus[RespStatus["INVALID_REQUEST"] = 1] = "INVALID_REQUEST";
    /**
     * The responder encountered an error while processing the request. The response payload adheres to the ErrorMessage schema
     */
    RespStatus[RespStatus["SERVER_ERROR"] = 2] = "SERVER_ERROR";
    /**
     * The responder does not have requested resource.  The response payload adheres to the ErrorMessage schema (described below). Note: This response code is only valid as a response to BlocksByRange
     */
    RespStatus[RespStatus["RESOURCE_UNAVAILABLE"] = 3] = "RESOURCE_UNAVAILABLE";
    /**
     * Our node does not have bandwidth to serve requests due to either per-peer quota or total quota.
     */
    RespStatus[RespStatus["RATE_LIMITED"] = 139] = "RATE_LIMITED";
})(RespStatus = exports.RespStatus || (exports.RespStatus = {}));
/** The maximum allowed size of uncompressed gossip messages. */
exports.GOSSIP_MAX_SIZE = 2 ** 20;
/** The maximum allowed size of uncompressed req/resp chunked responses. */
exports.MAX_CHUNK_SIZE = 2 ** 20;
/** The maximum time to wait for first byte of request response (time-to-first-byte). */
exports.TTFB_TIMEOUT = 5 * 1000; // 5 sec
/** The maximum time for complete response transfer. */
exports.RESP_TIMEOUT = 10 * 1000; // 10 sec
/** Non-spec timeout from sending request until write stream closed by responder */
exports.REQUEST_TIMEOUT = 5 * 1000; // 5 sec
/** Non-spec timeout from dialing protocol until stream opened */
exports.DIAL_TIMEOUT = 5 * 1000; // 5 sec
// eslint-disable-next-line @typescript-eslint/naming-convention
exports.timeoutOptions = { TTFB_TIMEOUT: exports.TTFB_TIMEOUT, RESP_TIMEOUT: exports.RESP_TIMEOUT, REQUEST_TIMEOUT: exports.REQUEST_TIMEOUT, DIAL_TIMEOUT: exports.DIAL_TIMEOUT };
var GoodByeReasonCode;
(function (GoodByeReasonCode) {
    GoodByeReasonCode[GoodByeReasonCode["CLIENT_SHUTDOWN"] = 1] = "CLIENT_SHUTDOWN";
    GoodByeReasonCode[GoodByeReasonCode["IRRELEVANT_NETWORK"] = 2] = "IRRELEVANT_NETWORK";
    GoodByeReasonCode[GoodByeReasonCode["ERROR"] = 3] = "ERROR";
    GoodByeReasonCode[GoodByeReasonCode["TOO_MANY_PEERS"] = 129] = "TOO_MANY_PEERS";
    GoodByeReasonCode[GoodByeReasonCode["SCORE_TOO_LOW"] = 250] = "SCORE_TOO_LOW";
    GoodByeReasonCode[GoodByeReasonCode["BANNED"] = 251] = "BANNED";
})(GoodByeReasonCode = exports.GoodByeReasonCode || (exports.GoodByeReasonCode = {}));
// eslint-disable-next-line @typescript-eslint/naming-convention
exports.GOODBYE_KNOWN_CODES = {
    0: "Unknown",
    // spec-defined codes
    1: "Client shutdown",
    2: "Irrelevant network",
    3: "Internal fault/error",
    // Teku-defined codes
    128: "Unable to verify network",
    // Lighthouse-defined codes
    129: "Client has too many peers",
    250: "Peer score too low",
    251: "Peer banned this node",
};
/** Until js-libp2p types its events */
var Libp2pEvent;
(function (Libp2pEvent) {
    Libp2pEvent["peerConnect"] = "peer:connect";
    Libp2pEvent["peerDisconnect"] = "peer:disconnect";
})(Libp2pEvent = exports.Libp2pEvent || (exports.Libp2pEvent = {}));
//# sourceMappingURL=network.js.map