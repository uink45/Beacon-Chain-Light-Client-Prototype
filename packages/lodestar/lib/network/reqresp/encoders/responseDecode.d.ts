/// <reference types="node" />
import { ForkName } from "@chainsafe/lodestar-params";
import { IForkDigestContext } from "@chainsafe/lodestar-config";
import { RespStatus } from "../../../constants";
import { BufferedSource } from "../utils";
import { Protocol, IncomingResponseBody, ContextBytesType } from "../types";
/**
 * Internal helper type to signal stream ended early
 */
declare enum StreamStatus {
    Ended = "STREAM_ENDED"
}
/**
 * Consumes a stream source to read a `<response>`
 * ```bnf
 * response        ::= <response_chunk>*
 * response_chunk  ::= <result> | <context-bytes> | <encoding-dependent-header> | <encoded-payload>
 * result          ::= "0" | "1" | "2" | ["128" ... "255"]
 * ```
 */
export declare function responseDecode(forkDigestContext: IForkDigestContext, protocol: Protocol): (source: AsyncIterable<Buffer>) => AsyncGenerator<IncomingResponseBody>;
/**
 * Consumes a stream source to read a `<result>`
 * ```bnf
 * result  ::= "0" | "1" | "2" | ["128" ... "255"]
 * ```
 * `<response_chunk>` starts with a single-byte response code which determines the contents of the response_chunk
 */
export declare function readResultHeader(bufferedSource: BufferedSource): Promise<RespStatus | StreamStatus>;
/**
 * Consumes a stream source to read an optional `<error_response>?`
 * ```bnf
 * error_response  ::= <result> | <error_message>?
 * result          ::= "1" | "2" | ["128" ... "255"]
 * ```
 */
export declare function readErrorMessage(bufferedSource: BufferedSource): Promise<string>;
/**
 * Consumes a stream source to read a variable length `<context-bytes>` depending on the method.
 * While `<context-bytes>` has a single type of `ForkDigest`, this function only parses the `ForkName`
 * of the `ForkDigest` or defaults to `phase0`
 */
export declare function readForkName(forkDigestContext: IForkDigestContext, bufferedSource: BufferedSource, contextBytes: ContextBytesType): Promise<ForkName>;
/**
 * Consumes a stream source to read `<context-bytes>`, where it's a fixed-width 4 byte
 */
export declare function readContextBytesForkDigest(bufferedSource: BufferedSource): Promise<Buffer>;
export {};
//# sourceMappingURL=responseDecode.d.ts.map