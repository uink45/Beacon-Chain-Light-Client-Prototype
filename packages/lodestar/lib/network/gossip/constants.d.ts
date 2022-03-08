/**
 * @module network/gossip
 */
/// <reference types="node" />
import { GossipEncoding } from "./interface";
export declare const GOSSIP_MSGID_LENGTH = 20;
/**
 * 4-byte domain for gossip message-id isolation of *valid* snappy messages
 */
export declare const MESSAGE_DOMAIN_VALID_SNAPPY: Buffer;
/**
 * 4-byte domain for gossip message-id isolation of *invalid* snappy messages
 */
export declare const MESSAGE_DOMAIN_INVALID_SNAPPY: Buffer;
export declare const DEFAULT_ENCODING = GossipEncoding.ssz_snappy;
//# sourceMappingURL=constants.d.ts.map