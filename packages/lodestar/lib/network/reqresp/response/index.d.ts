import PeerId from "peer-id";
import { AbortSignal } from "@chainsafe/abort-controller";
import { Libp2p } from "libp2p/src/connection-manager";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { Protocol, RequestBody, OutgoingResponseBody } from "../types";
import { Libp2pStream } from "../interface";
import { ResponseError } from "./errors";
export { ResponseError };
export declare type PerformRequestHandler = (protocol: Protocol, requestBody: RequestBody, peerId: PeerId) => AsyncIterable<OutgoingResponseBody>;
declare type HandleRequestModules = {
    config: IBeaconConfig;
    logger: ILogger;
    libp2p: Libp2p;
};
/**
 * Handles a ReqResp request from a peer. Throws on error. Logs each step of the response lifecycle.
 *
 * 1. A duplex `stream` with the peer is already available
 * 2. Read and decode request from peer
 * 3. Delegate to `performRequestHandler()` to perform the request job and expect
 *    to yield zero or more `<response_chunks>`
 * 4a. Encode and write `<response_chunks>` to peer
 * 4b. On error, encode and write an error `<response_chunk>` and stop
 */
export declare function handleRequest({ config, logger, libp2p }: HandleRequestModules, performRequestHandler: PerformRequestHandler, stream: Libp2pStream, peerId: PeerId, protocol: Protocol, signal?: AbortSignal, requestId?: number): Promise<void>;
//# sourceMappingURL=index.d.ts.map