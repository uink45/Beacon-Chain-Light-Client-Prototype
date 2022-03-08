"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @module network
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentVersionFromPeerStore = exports.getClientFromPeerStore = exports.prettyPrintPeerId = exports.clearMultiaddrUDP = exports.isLocalMultiAddr = exports.createPeerId = void 0;
const peer_id_1 = __importDefault(require("peer-id"));
const node_os_1 = require("node:os");
const client_1 = require("./peers/client");
// peers
/**
 * Return a fresh PeerId instance
 */
async function createPeerId() {
    return await peer_id_1.default.create({ bits: 256, keyType: "secp256k1" });
}
exports.createPeerId = createPeerId;
/**
 * Check if multiaddr belongs to the local network interfaces.
 */
function isLocalMultiAddr(multiaddr) {
    if (!multiaddr)
        return false;
    const protoNames = multiaddr.protoNames();
    if (protoNames.length !== 2 && protoNames[1] !== "udp") {
        throw new Error("Invalid udp multiaddr");
    }
    const interfaces = (0, node_os_1.networkInterfaces)();
    const tuples = multiaddr.tuples();
    const isIPv4 = tuples[0][0] === 4;
    const family = isIPv4 ? "IPv4" : "IPv6";
    const ip = tuples[0][1];
    if (!ip) {
        return false;
    }
    const ipStr = isIPv4
        ? Array.from(ip).join(".")
        : Array.from(Uint16Array.from(ip))
            .map((n) => n.toString(16))
            .join(":");
    for (const networkInterfaces of Object.values(interfaces)) {
        for (const networkInterface of networkInterfaces || []) {
            if (networkInterface.family === family && networkInterface.address === ipStr) {
                return true;
            }
        }
    }
    return false;
}
exports.isLocalMultiAddr = isLocalMultiAddr;
function clearMultiaddrUDP(enr) {
    // enr.multiaddrUDP = undefined in new version
    enr.delete("ip");
    enr.delete("udp");
    enr.delete("ip6");
    enr.delete("udp6");
}
exports.clearMultiaddrUDP = clearMultiaddrUDP;
function prettyPrintPeerId(peerId) {
    const id = peerId.toB58String();
    return `${id.substr(0, 2)}...${id.substr(id.length - 6, id.length)}`;
}
exports.prettyPrintPeerId = prettyPrintPeerId;
function getClientFromPeerStore(peerId, metadataBook) {
    const agentVersion = getAgentVersionFromPeerStore(peerId, metadataBook);
    return (0, client_1.clientFromAgentVersion)(agentVersion);
}
exports.getClientFromPeerStore = getClientFromPeerStore;
function getAgentVersionFromPeerStore(peerId, metadataBook) {
    return new TextDecoder().decode(metadataBook.getValue(peerId, "AgentVersion")) || "N/A";
}
exports.getAgentVersionFromPeerStore = getAgentVersionFromPeerStore;
//# sourceMappingURL=util.js.map