/// <reference types="node" />
import { Encoding, RequestOrResponseType, RequestOrIncomingResponseBody, RequestOrOutgoingResponseBody, OutgoingSerializer } from "../types";
import { BufferedSource } from "../utils";
import { ISszSnappyOptions } from "./sszSnappy/decode";
/**
 * Consumes a stream source to read encoded header and payload as defined in the spec:
 * ```
 * <encoding-dependent-header> | <encoded-payload>
 * ```
 */
export declare function readEncodedPayload<T extends RequestOrIncomingResponseBody>(bufferedSource: BufferedSource, encoding: Encoding, type: RequestOrResponseType, options?: ISszSnappyOptions): Promise<T>;
/**
 * Yields byte chunks for encoded header and payload as defined in the spec:
 * ```
 * <encoding-dependent-header> | <encoded-payload>
 * ```
 */
export declare function writeEncodedPayload<T extends RequestOrOutgoingResponseBody>(body: T, encoding: Encoding, serializer: OutgoingSerializer): AsyncGenerator<Buffer>;
//# sourceMappingURL=index.d.ts.map