/// <reference types="node" />
import { RequestOrOutgoingResponseBody, OutgoingSerializer } from "../../types";
/**
 * ssz_snappy encoding strategy writer.
 * Yields byte chunks for encoded header and payload as defined in the spec:
 * ```
 * <encoding-dependent-header> | <encoded-payload>
 * ```
 */
export declare function writeSszSnappyPayload<T extends RequestOrOutgoingResponseBody>(body: T, serializer: OutgoingSerializer): AsyncGenerator<Buffer>;
//# sourceMappingURL=encode.d.ts.map