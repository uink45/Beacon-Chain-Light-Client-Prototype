"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultNetworkOptions = exports.defaultDiscv5Options = void 0;
const discv5_1 = require("@chainsafe/discv5");
const handlers_1 = require("./gossip/handlers");
const rateLimiter_1 = require("./reqresp/response/rateLimiter");
exports.defaultDiscv5Options = {
    bindAddr: "/ip4/0.0.0.0/udp/9000",
    enr: new discv5_1.ENR(),
    bootEnrs: [],
    enrUpdate: true,
    enabled: true,
};
exports.defaultNetworkOptions = {
    maxPeers: 30,
    targetPeers: 25,
    discv5FirstQueryDelayMs: 1000,
    localMultiaddrs: ["/ip4/0.0.0.0/tcp/9000"],
    bootMultiaddrs: [],
    discv5: exports.defaultDiscv5Options,
    ...rateLimiter_1.defaultRateLimiterOpts,
    ...handlers_1.defaultGossipHandlerOpts,
};
//# sourceMappingURL=options.js.map