/// <reference types="node" />
import { timeoutOptions } from "../../../constants";
/** Returns the maximum total timeout possible for a response. See @responseTimeoutsHandler */
export declare function maxTotalResponseTimeout(maxResponses?: number, options?: Partial<typeof timeoutOptions>): number;
/**
 * Wraps responseDecoder to isolate the logic that handles response timeouts.
 * - TTFB_TIMEOUT: The requester MUST wait a maximum of TTFB_TIMEOUT for the first response byte to arrive
 * - RESP_TIMEOUT: Requester allows a further RESP_TIMEOUT for each subsequent response_chunk
 */
export declare function responseTimeoutsHandler<T>(responseDecoder: (source: AsyncIterable<Buffer>) => AsyncGenerator<T>, options?: Partial<typeof timeoutOptions>): (source: AsyncIterable<Buffer>) => AsyncGenerator<T>;
//# sourceMappingURL=responseTimeoutsHandler.d.ts.map