/// <reference types="node" />
import BufferList from "bl";
import { Protocol, RequestBody } from "../types";
/**
 * Consumes a stream source to read a `<request>`
 * ```bnf
 * request  ::= <encoding-dependent-header> | <encoded-payload>
 * ```
 */
export declare function requestDecode(protocol: Pick<Protocol, "method" | "encoding">): (source: AsyncIterable<Buffer | BufferList>) => Promise<RequestBody>;
//# sourceMappingURL=requestDecode.d.ts.map