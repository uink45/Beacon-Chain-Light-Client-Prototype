import { ForkName } from "@chainsafe/lodestar-params";
import { allForks, phase0 } from "@chainsafe/lodestar-types";
import PeerId from "peer-id";
import { timeoutOptions } from "../../constants";
import { IReqResp, IReqRespModules } from "./interface";
import { RateLimiterOpts } from "./response/rateLimiter";
export declare type IReqRespOptions = Partial<typeof timeoutOptions>;
/**
 * Implementation of eth2 p2p Req/Resp domain.
 * For the spec that this code is based on, see:
 * https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/p2p-interface.md#the-reqresp-domain
 */
export declare class ReqResp implements IReqResp {
    private config;
    private libp2p;
    private logger;
    private reqRespHandlers;
    private metadataController;
    private peerMetadata;
    private peerRpcScores;
    private inboundRateLimiter;
    private networkEventBus;
    private controller;
    private options?;
    private reqCount;
    private respCount;
    private metrics;
    constructor(modules: IReqRespModules, options: IReqRespOptions & RateLimiterOpts);
    start(): void;
    stop(): void;
    status(peerId: PeerId, request: phase0.Status): Promise<phase0.Status>;
    goodbye(peerId: PeerId, request: phase0.Goodbye): Promise<void>;
    ping(peerId: PeerId): Promise<phase0.Ping>;
    metadata(peerId: PeerId, fork?: ForkName): Promise<allForks.Metadata>;
    beaconBlocksByRange(peerId: PeerId, request: phase0.BeaconBlocksByRangeRequest): Promise<allForks.SignedBeaconBlock[]>;
    beaconBlocksByRoot(peerId: PeerId, request: phase0.BeaconBlocksByRootRequest): Promise<allForks.SignedBeaconBlock[]>;
    pruneRateLimiterData(peerId: PeerId): void;
    private sendRequest;
    private getRequestHandler;
    private onRequest;
}
//# sourceMappingURL=reqResp.d.ts.map