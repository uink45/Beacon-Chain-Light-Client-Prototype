/// <reference types="node" />
import { Protocol, RequestBody } from "../types";
/**
 * Yields byte chunks for a `<request>`
 * ```bnf
 * request  ::= <encoding-dependent-header> | <encoded-payload>
 * ```
 * Requests may contain no payload (e.g. /eth2/beacon_chain/req/metadata/1/)
 * if so, it would yield no byte chunks
 */
export declare function requestEncode(protocol: Pick<Protocol, "method" | "encoding">, requestBody: RequestBody): AsyncGenerator<Buffer>;
//# sourceMappingURL=requestEncode.d.ts.map