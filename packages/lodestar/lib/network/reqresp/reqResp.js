"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReqResp = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const abort_controller_1 = require("@chainsafe/abort-controller");
const constants_1 = require("../../constants");
const request_1 = require("./request");
const response_1 = require("./response");
const score_1 = require("./score");
const utils_1 = require("./utils");
const events_1 = require("../events");
const request_2 = require("./request");
const types_1 = require("./types");
const rateLimiter_1 = require("./response/rateLimiter");
/**
 * Implementation of eth2 p2p Req/Resp domain.
 * For the spec that this code is based on, see:
 * https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/p2p-interface.md#the-reqresp-domain
 */
class ReqResp {
    constructor(modules, options) {
        this.controller = new abort_controller_1.AbortController();
        this.reqCount = 0;
        this.respCount = 0;
        this.config = modules.config;
        this.libp2p = modules.libp2p;
        this.logger = modules.logger;
        this.reqRespHandlers = modules.reqRespHandlers;
        this.peerMetadata = modules.peerMetadata;
        this.metadataController = modules.metadata;
        this.peerRpcScores = modules.peerRpcScores;
        this.inboundRateLimiter = new rateLimiter_1.InboundRateLimiter(options, { ...modules });
        this.networkEventBus = modules.networkEventBus;
        this.options = options;
        this.metrics = modules.metrics;
    }
    start() {
        this.controller = new abort_controller_1.AbortController();
        for (const [method, version, encoding] of types_1.protocolsSupported) {
            this.libp2p.handle((0, utils_1.formatProtocolId)(method, version, encoding), this.getRequestHandler({ method, version, encoding }));
        }
        this.inboundRateLimiter.start();
    }
    stop() {
        for (const [method, version, encoding] of types_1.protocolsSupported) {
            this.libp2p.unhandle((0, utils_1.formatProtocolId)(method, version, encoding));
        }
        this.controller.abort();
        this.inboundRateLimiter.stop();
    }
    async status(peerId, request) {
        return await this.sendRequest(peerId, types_1.Method.Status, [types_1.Version.V1], request);
    }
    async goodbye(peerId, request) {
        await this.sendRequest(peerId, types_1.Method.Goodbye, [types_1.Version.V1], request);
    }
    async ping(peerId) {
        return await this.sendRequest(peerId, types_1.Method.Ping, [types_1.Version.V1], this.metadataController.seqNumber);
    }
    async metadata(peerId, fork) {
        // Only request V1 if forcing phase0 fork. It's safe to not specify `fork` and let stream negotiation pick the version
        const versions = fork === lodestar_params_1.ForkName.phase0 ? [types_1.Version.V1] : [types_1.Version.V2, types_1.Version.V1];
        return await this.sendRequest(peerId, types_1.Method.Metadata, versions, null);
    }
    async beaconBlocksByRange(peerId, request) {
        const blocks = await this.sendRequest(peerId, types_1.Method.BeaconBlocksByRange, [types_1.Version.V2, types_1.Version.V1], // Prioritize V2
        request, request.count);
        (0, utils_1.assertSequentialBlocksInRange)(blocks, request);
        return blocks;
    }
    async beaconBlocksByRoot(peerId, request) {
        return await this.sendRequest(peerId, types_1.Method.BeaconBlocksByRoot, [types_1.Version.V2, types_1.Version.V1], // Prioritize V2
        request, request.length);
    }
    pruneRateLimiterData(peerId) {
        this.inboundRateLimiter.prune(peerId);
    }
    // Helper to reduce code duplication
    async sendRequest(peerId, method, versions, body, maxResponses = 1) {
        var _a, _b, _c, _d;
        try {
            (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.reqRespOutgoingRequests.inc({ method });
            const encoding = (_b = this.peerMetadata.encoding.get(peerId)) !== null && _b !== void 0 ? _b : types_1.Encoding.SSZ_SNAPPY;
            const result = await (0, request_1.sendRequest)({ forkDigestContext: this.config, logger: this.logger, libp2p: this.libp2p }, peerId, method, encoding, versions, body, maxResponses, this.controller.signal, this.options, this.reqCount++);
            return result;
        }
        catch (e) {
            (_c = this.metrics) === null || _c === void 0 ? void 0 : _c.reqRespOutgoingErrors.inc({ method });
            const peerAction = (0, score_1.onOutgoingReqRespError)(e, method);
            if (e instanceof request_2.RequestError &&
                (e.type.code === request_2.RequestErrorCode.DIAL_ERROR || e.type.code === request_2.RequestErrorCode.DIAL_TIMEOUT)) {
                (_d = this.metrics) === null || _d === void 0 ? void 0 : _d.reqRespDialErrors.inc();
            }
            if (peerAction !== null)
                this.peerRpcScores.applyAction(peerId, peerAction);
            throw e;
        }
    }
    getRequestHandler({ method, version, encoding }) {
        return async ({ connection, stream }) => {
            var _a, _b;
            const peerId = connection.remotePeer;
            // TODO: Do we really need this now that there is only one encoding?
            // Remember the prefered encoding of this peer
            if (method === types_1.Method.Status) {
                this.peerMetadata.encoding.set(peerId, encoding);
            }
            try {
                (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.reqRespIncomingRequests.inc({ method });
                await (0, response_1.handleRequest)({ config: this.config, logger: this.logger, libp2p: this.libp2p }, this.onRequest.bind(this), stream, peerId, { method, version, encoding }, this.controller.signal, this.respCount++);
                // TODO: Do success peer scoring here
            }
            catch {
                (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.reqRespIncomingErrors.inc({ method });
                // TODO: Do error peer scoring here
                // Must not throw since this is an event handler
            }
        };
    }
    async *onRequest(protocol, requestBody, peerId) {
        const requestTyped = { method: protocol.method, body: requestBody };
        if (requestTyped.method !== types_1.Method.Goodbye && !this.inboundRateLimiter.allowRequest(peerId, requestTyped)) {
            throw new response_1.ResponseError(constants_1.RespStatus.RATE_LIMITED, "rate limit");
        }
        switch (requestTyped.method) {
            case types_1.Method.Ping:
                yield this.metadataController.seqNumber;
                break;
            case types_1.Method.Metadata:
                // V1 -> phase0, V2 -> altair. But the type serialization of phase0.Metadata will just ignore the extra .syncnets property
                // It's safe to return altair.Metadata here for all versions
                yield this.metadataController.json;
                break;
            case types_1.Method.Goodbye:
                yield BigInt(0);
                break;
            // Don't bubble Ping, Metadata, and, Goodbye requests to the app layer
            case types_1.Method.Status:
                yield* this.reqRespHandlers.onStatus();
                break;
            case types_1.Method.BeaconBlocksByRange:
                yield* this.reqRespHandlers.onBeaconBlocksByRange(requestTyped.body);
                break;
            case types_1.Method.BeaconBlocksByRoot:
                yield* this.reqRespHandlers.onBeaconBlocksByRoot(requestTyped.body);
                break;
            default:
                throw Error(`Unsupported method ${protocol.method}`);
        }
        // Allow onRequest to return and close the stream
        // For Goodbye there may be a race condition where the listener of `receivedGoodbye`
        // disconnects in the same syncronous call, preventing the stream from ending cleanly
        setTimeout(() => this.networkEventBus.emit(events_1.NetworkEvent.reqRespRequest, requestTyped, peerId), 0);
    }
}
exports.ReqResp = ReqResp;
//# sourceMappingURL=reqResp.js.map