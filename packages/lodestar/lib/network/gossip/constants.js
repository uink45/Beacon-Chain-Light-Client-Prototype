"use strict";
/**
 * @module network/gossip
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ENCODING = exports.MESSAGE_DOMAIN_INVALID_SNAPPY = exports.MESSAGE_DOMAIN_VALID_SNAPPY = exports.GOSSIP_MSGID_LENGTH = void 0;
const interface_1 = require("./interface");
exports.GOSSIP_MSGID_LENGTH = 20;
/**
 * 4-byte domain for gossip message-id isolation of *valid* snappy messages
 */
exports.MESSAGE_DOMAIN_VALID_SNAPPY = Buffer.from("01000000", "hex");
/**
 * 4-byte domain for gossip message-id isolation of *invalid* snappy messages
 */
exports.MESSAGE_DOMAIN_INVALID_SNAPPY = Buffer.from("00000000", "hex");
exports.DEFAULT_ENCODING = interface_1.GossipEncoding.ssz_snappy;
//# sourceMappingURL=constants.js.map