"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeMsgIdAltair = exports.computeMsgIdPhase0 = exports.computeMsgId = exports.encodeMessageData = exports.decodeMessageData = exports.UncompressCache = void 0;
const snappyjs_1 = require("snappyjs");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const ssz_1 = require("@chainsafe/ssz");
const constants_1 = require("./constants");
const interface_1 = require("./interface");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
class UncompressCache {
    constructor() {
        this.cache = new WeakMap();
    }
    uncompress(input) {
        let uncompressed = this.cache.get(input);
        if (!uncompressed) {
            uncompressed = (0, snappyjs_1.uncompress)(input);
            this.cache.set(input, uncompressed);
        }
        return uncompressed;
    }
}
exports.UncompressCache = UncompressCache;
/**
 * Decode message using `IUncompressCache`. Message will have been uncompressed before to compute the msgId.
 * We must re-use that result to prevent uncompressing the object again here.
 */
function decodeMessageData(encoding, msgData, uncompressCache) {
    switch (encoding) {
        case interface_1.GossipEncoding.ssz_snappy:
            return uncompressCache.uncompress(msgData);
        default:
            throw new Error(`Unsupported encoding ${encoding}`);
    }
}
exports.decodeMessageData = decodeMessageData;
function encodeMessageData(encoding, msgData) {
    switch (encoding) {
        case interface_1.GossipEncoding.ssz_snappy:
            return (0, snappyjs_1.compress)(msgData);
        default:
            throw new Error(`Unsupported encoding ${encoding}`);
    }
}
exports.encodeMessageData = encodeMessageData;
/**
 * Function to compute message id for all forks.
 */
function computeMsgId(topic, topicStr, msgData, uncompressCache) {
    switch (topic.fork) {
        case lodestar_params_1.ForkName.phase0:
            return computeMsgIdPhase0(topic, msgData, uncompressCache);
        case lodestar_params_1.ForkName.altair:
        case lodestar_params_1.ForkName.bellatrix:
            return computeMsgIdAltair(topic, topicStr, msgData, uncompressCache);
    }
}
exports.computeMsgId = computeMsgId;
/**
 * Function to compute message id for phase0.
 * ```
 * SHA256(MESSAGE_DOMAIN_VALID_SNAPPY + snappy_decompress(message.data))[:20]
 * ```
 */
function computeMsgIdPhase0(topic, msgData, uncompressCache) {
    var _a;
    switch ((_a = topic.encoding) !== null && _a !== void 0 ? _a : constants_1.DEFAULT_ENCODING) {
        case interface_1.GossipEncoding.ssz_snappy:
            try {
                const uncompressed = uncompressCache.uncompress(msgData);
                return hashGossipMsgData(constants_1.MESSAGE_DOMAIN_VALID_SNAPPY, uncompressed);
            }
            catch (e) {
                return hashGossipMsgData(constants_1.MESSAGE_DOMAIN_INVALID_SNAPPY, msgData);
            }
    }
}
exports.computeMsgIdPhase0 = computeMsgIdPhase0;
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
function computeMsgIdAltair(topic, topicStr, msgData, uncompressCache) {
    var _a;
    switch ((_a = topic.encoding) !== null && _a !== void 0 ? _a : constants_1.DEFAULT_ENCODING) {
        case interface_1.GossipEncoding.ssz_snappy:
            try {
                const uncompressed = uncompressCache.uncompress(msgData);
                return hashGossipMsgData(constants_1.MESSAGE_DOMAIN_VALID_SNAPPY, (0, lodestar_utils_1.intToBytes)(topicStr.length, 8), Buffer.from(topicStr), uncompressed);
            }
            catch (e) {
                return hashGossipMsgData(constants_1.MESSAGE_DOMAIN_INVALID_SNAPPY, (0, lodestar_utils_1.intToBytes)(topicStr.length, 8), Buffer.from(topicStr), msgData);
            }
    }
}
exports.computeMsgIdAltair = computeMsgIdAltair;
function hashGossipMsgData(...dataArrToHash) {
    return (0, ssz_1.hash)(Buffer.concat(dataArrToHash)).slice(0, constants_1.GOSSIP_MSGID_LENGTH);
}
//# sourceMappingURL=encoding.js.map