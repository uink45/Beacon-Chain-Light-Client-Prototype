"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkEventBus = exports.NetworkEvent = void 0;
const events_1 = require("events");
var NetworkEvent;
(function (NetworkEvent) {
    /** A relevant peer has connected or has been re-STATUS'd */
    NetworkEvent["peerConnected"] = "peer-manager.peer-connected";
    NetworkEvent["peerDisconnected"] = "peer-manager.peer-disconnected";
    NetworkEvent["gossipStart"] = "gossip.start";
    NetworkEvent["gossipStop"] = "gossip.stop";
    NetworkEvent["gossipHeartbeat"] = "gossipsub.heartbeat";
    NetworkEvent["reqRespRequest"] = "req-resp.request";
    NetworkEvent["unknownBlockParent"] = "unknownBlockParent";
})(NetworkEvent = exports.NetworkEvent || (exports.NetworkEvent = {}));
class NetworkEventBus extends events_1.EventEmitter {
}
exports.NetworkEventBus = NetworkEventBus;
//# sourceMappingURL=events.js.map