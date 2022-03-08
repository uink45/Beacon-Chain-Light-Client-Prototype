import { AbortSignal } from "@chainsafe/abort-controller";
import PeerId from "peer-id";
import { Libp2p } from "libp2p/src/connection-manager";
import { IForkDigestContext } from "@chainsafe/lodestar-config";
import { ILogger } from "@chainsafe/lodestar-utils";
import { timeoutOptions } from "../../../constants";
import { Method, Encoding, Version, IncomingResponseBody, RequestBody } from "../types";
import { RequestError, RequestErrorCode } from "./errors";
export { RequestError, RequestErrorCode };
declare type SendRequestModules = {
    logger: ILogger;
    forkDigestContext: IForkDigestContext;
    libp2p: Libp2p;
};
/**
 * Sends ReqResp request to a peer. Throws on error. Logs each step of the request lifecycle.
 *
 * 1. Dial peer, establish duplex stream
 * 2. Encoded and write request to peer. Expect the responder to close the stream's write side
 * 3. Read and decode reponse(s) from peer. Will close the read stream if:
 *    - An error result is received in one of the chunks. Reads the error_message and throws.
 *    - The responder closes the stream. If at the end or start of a <response_chunk>, return. Otherwise throws
 *    - Any part of the response_chunk fails validation. Throws a typed error (see `SszSnappyError`)
 *    - The maximum number of requested chunks are read. Does not throw, returns read chunks only.
 */
export declare function sendRequest<T extends IncomingResponseBody | IncomingResponseBody[]>({ logger, forkDigestContext, libp2p }: SendRequestModules, peerId: PeerId, method: Method, encoding: Encoding, versions: Version[], requestBody: RequestBody, maxResponses: number, signal?: AbortSignal, options?: Partial<typeof timeoutOptions>, requestId?: number): Promise<T>;
//# sourceMappingURL=index.d.ts.map