/// <reference types="node" />
import { EventEmitter } from "events";
import PeerId from "peer-id";
import StrictEventEmitter from "strict-event-emitter-types";
import { allForks, phase0 } from "@chainsafe/lodestar-types";
import { RequestTypedContainer } from "./reqresp";
export declare enum NetworkEvent {
    /** A relevant peer has connected or has been re-STATUS'd */
    peerConnected = "peer-manager.peer-connected",
    peerDisconnected = "peer-manager.peer-disconnected",
    gossipStart = "gossip.start",
    gossipStop = "gossip.stop",
    gossipHeartbeat = "gossipsub.heartbeat",
    reqRespRequest = "req-resp.request",
    unknownBlockParent = "unknownBlockParent"
}
export declare type NetworkEvents = {
    [NetworkEvent.peerConnected]: (peer: PeerId, status: phase0.Status) => void;
    [NetworkEvent.peerDisconnected]: (peer: PeerId) => void;
    [NetworkEvent.reqRespRequest]: (request: RequestTypedContainer, peer: PeerId) => void;
    [NetworkEvent.unknownBlockParent]: (signedBlock: allForks.SignedBeaconBlock, peerIdStr: string) => void;
};
export declare type INetworkEventBus = StrictEventEmitter<EventEmitter, NetworkEvents>;
declare const NetworkEventBus_base: new () => INetworkEventBus;
export declare class NetworkEventBus extends NetworkEventBus_base {
}
export {};
//# sourceMappingURL=events.d.ts.map