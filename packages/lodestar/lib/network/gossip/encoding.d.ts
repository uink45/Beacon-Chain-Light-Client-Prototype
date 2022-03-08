import { GossipEncoding, GossipTopic } from "./interface";
export interface IUncompressCache {
    uncompress(input: Uint8Array): Uint8Array;
}
export declare class UncompressCache implements IUncompressCache {
    private cache;
    uncompress(input: Uint8Array): Uint8Array;
}
/**
 * Decode message using `IUncompressCache`. Message will have been uncompressed before to compute the msgId.
 * We must re-use that result to prevent uncompressing the object again here.
 */
export declare function decodeMessageData(encoding: GossipEncoding, msgData: Uint8Array, uncompressCache: IUncompressCache): Uint8Array;
export declare function encodeMessageData(encoding: GossipEncoding, msgData: Uint8Array): Uint8Array;
/**
 * Function to compute message id for all forks.
 */
export declare function computeMsgId(topic: GossipTopic, topicStr: string, msgData: Uint8Array, uncompressCache: IUncompressCache): Uint8Array;
/**
 * Function to compute message id for phase0.
 * ```
 * SHA256(MESSAGE_DOMAIN_VALID_SNAPPY + snappy_decompress(message.data))[:20]
 * ```
 */
export declare function computeMsgIdPhase0(topic: GossipTopic, msgData: Uint8Array, uncompressCache: IUncompressCache): Uint8Array;
/**
 * Function to compute message id for altair.
 *
 * ```
 * SHA256(
 *   MESSAGE_DOMAIN_VALID_SNAPPY +
 *   uint_to_bytes(uint64(len(message.topic))) +
 *   message.topic +
 *   snappy_decompress(message.data)
 * )[:20]
 * ```
 * https://github.com/ethereum/eth2.0-specs/blob/v1.1.0-alpha.7/specs/altair/p2p-interface.md#topics-and-messages
 */
export declare function computeMsgIdAltair(topic: GossipTopic, topicStr: string, msgData: Uint8Array, uncompressCache: IUncompressCache): Uint8Array;
//# sourceMappingURL=encoding.d.ts.map