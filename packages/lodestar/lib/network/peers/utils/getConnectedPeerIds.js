"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSomeConnectedPeer = exports.getConnectedPeerIds = void 0;
/**
 * Return peers with at least one connection in status "open"
 */
function getConnectedPeerIds(libp2p) {
    const peerIds = [];
    for (const connections of libp2p.connectionManager.connections.values()) {
        const openConnection = connections.find(isConnectionOpen);
        if (openConnection) {
            peerIds.push(openConnection.remotePeer);
        }
    }
    return peerIds;
}
exports.getConnectedPeerIds = getConnectedPeerIds;
/**
 * Efficiently check if there is at least one peer connected
 */
function hasSomeConnectedPeer(libp2p) {
    for (const connections of libp2p.connectionManager.connections.values()) {
        if (connections.some(isConnectionOpen)) {
            return true;
        }
    }
    return false;
}
exports.hasSomeConnectedPeer = hasSomeConnectedPeer;
function isConnectionOpen(connection) {
    return connection.stat.status === "open";
}
//# sourceMappingURL=getConnectedPeerIds.js.map