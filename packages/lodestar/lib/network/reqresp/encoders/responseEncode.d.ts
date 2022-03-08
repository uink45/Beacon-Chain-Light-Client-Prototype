/// <reference types="node" />
import { ForkName } from "@chainsafe/lodestar-params";
import { RpcResponseStatusError } from "../../../constants";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { Method, Protocol, OutgoingResponseBody, OutgoingResponseBodyByMethod, ContextBytesType, IncomingResponseBodyByMethod } from "../types";
/**
 * Yields byte chunks for a `<response>` with a zero response code `<result>`
 * ```bnf
 * response        ::= <response_chunk>*
 * response_chunk  ::= <result> | <context-bytes> | <encoding-dependent-header> | <encoded-payload>
 * result          ::= "0"
 * ```
 * Note: `response` has zero or more chunks (denoted by `<>*`)
 */
export declare function responseEncodeSuccess(config: IBeaconConfig, protocol: Protocol): (source: AsyncIterable<OutgoingResponseBody>) => AsyncIterable<Buffer>;
/**
 * Yields byte chunks for a `<response_chunk>` with a non-zero response code `<result>`
 * denoted as `<error_response>`
 * ```bnf
 * error_response  ::= <result> | <error_message>?
 * result          ::= "1" | "2" | ["128" ... "255"]
 * ```
 * Only the last `<response_chunk>` is allowed to have a non-zero error code, so this
 * fn yields exactly one `<error_response>` and afterwards the stream must be terminated
 */
export declare function responseEncodeError(status: RpcResponseStatusError, errorMessage: string): AsyncGenerator<Buffer>;
/**
 * Yields byte chunks for a `<context-bytes>`. See `ContextBytesType` for possible types.
 * This item is mandatory but may be empty.
 */
export declare function writeContextBytes(config: IBeaconConfig, contextBytesType: ContextBytesType, forkName: ForkName): AsyncGenerator<Buffer>;
export declare function getForkNameFromResponseBody<K extends Method>(config: IBeaconConfig, protocol: Protocol, body: OutgoingResponseBodyByMethod[K] | IncomingResponseBodyByMethod[K]): ForkName;
//# sourceMappingURL=responseEncode.d.ts.map