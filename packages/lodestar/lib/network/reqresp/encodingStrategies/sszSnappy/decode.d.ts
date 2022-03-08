import { BufferedSource } from "../../utils";
import { RequestOrResponseType, RequestOrIncomingResponseBody } from "../../types";
export interface ISszSnappyOptions {
    deserializeToTree?: boolean;
}
/**
 * ssz_snappy encoding strategy reader.
 * Consumes a stream source to read encoded header and payload as defined in the spec:
 * ```bnf
 * <encoding-dependent-header> | <encoded-payload>
 * ```
 */
export declare function readSszSnappyPayload<T extends RequestOrIncomingResponseBody>(bufferedSource: BufferedSource, type: RequestOrResponseType, options?: ISszSnappyOptions): Promise<T>;
//# sourceMappingURL=decode.d.ts.map