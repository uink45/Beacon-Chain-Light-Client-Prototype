import { Method, IncomingResponseBody } from "../types";
/**
 * Sink for `<response_chunk>*`, from
 * ```bnf
 * response ::= <response_chunk>*
 * ```
 * Note: `response` has zero or more chunks for SSZ-list responses or exactly one chunk for non-list
 */
export declare function collectResponses<T extends IncomingResponseBody | IncomingResponseBody[]>(method: Method, maxResponses?: number): (source: AsyncIterable<IncomingResponseBody>) => Promise<T>;
//# sourceMappingURL=collectResponses.d.ts.map