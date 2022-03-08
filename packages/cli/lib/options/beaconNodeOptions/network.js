"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.parseArgs = void 0;
const lodestar_1 = require("@chainsafe/lodestar");
function parseArgs(args) {
    return {
        discv5: {
            enabled: args["network.discv5.enabled"],
            bindAddr: args["network.discv5.bindAddr"],
            bootEnrs: args["network.discv5.bootEnrs"],
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
            enr: undefined,
        },
        maxPeers: args["network.maxPeers"],
        targetPeers: args["network.targetPeers"],
        bootMultiaddrs: args["network.bootMultiaddrs"],
        localMultiaddrs: args["network.localMultiaddrs"],
        subscribeAllSubnets: args["network.subscribeAllSubnets"],
        connectToDiscv5Bootnodes: args["network.connectToDiscv5Bootnodes"],
        discv5FirstQueryDelayMs: args["network.discv5FirstQueryDelayMs"],
        requestCountPeerLimit: args["network.requestCountPeerLimit"],
        blockCountTotalLimit: args["network.blockCountTotalLimit"],
        blockCountPeerLimit: args["network.blockCountPeerLimit"],
        rateTrackerTimeoutMs: args["network.rateTrackerTimeoutMs"],
        dontSendGossipAttestationsToForkchoice: args["network.dontSendGossipAttestationsToForkchoice"],
    };
}
exports.parseArgs = parseArgs;
exports.options = {
    "network.discv5.enabled": {
        type: "boolean",
        // TODO: Add `network.discv5.enabled` to the `IDiscv5DiscoveryInputOptions` type
        description: "Enable discv5",
        defaultDescription: String(true),
        group: "network",
    },
    "network.discv5.bindAddr": {
        type: "string",
        description: "Local multiaddress to listen on for discv5",
        defaultDescription: (lodestar_1.defaultOptions.network.discv5 || {}).bindAddr || "",
        group: "network",
    },
    "network.discv5.bootEnrs": {
        type: "array",
        description: "Bootnodes for discv5 discovery",
        defaultDescription: JSON.stringify((lodestar_1.defaultOptions.network.discv5 || {}).bootEnrs || []),
        group: "network",
    },
    "network.maxPeers": {
        type: "number",
        description: "The maximum number of connections allowed",
        defaultDescription: String(lodestar_1.defaultOptions.network.maxPeers),
        group: "network",
    },
    "network.targetPeers": {
        type: "number",
        description: "The target connected peers. Above this number peers will be disconnected",
        defaultDescription: String(lodestar_1.defaultOptions.network.targetPeers),
        group: "network",
    },
    "network.bootMultiaddrs": {
        type: "array",
        description: "Libp2p peers to connect to on boot",
        defaultDescription: JSON.stringify(lodestar_1.defaultOptions.network.bootMultiaddrs),
        group: "network",
    },
    "network.localMultiaddrs": {
        type: "array",
        description: "Local listening addresses for req/resp and gossip",
        defaultDescription: lodestar_1.defaultOptions.network.localMultiaddrs.join(" "),
        group: "network",
    },
    "network.subscribeAllSubnets": {
        type: "boolean",
        description: "Subscribe to all subnets regardless of validator count",
        defaultDescription: String(lodestar_1.defaultOptions.network.subscribeAllSubnets === true),
        group: "network",
    },
    "network.connectToDiscv5Bootnodes": {
        type: "boolean",
        description: "Attempt direct connection to discv5 bootnodes from network.discv5.bootEnrs option",
        defaultDescription: String(lodestar_1.defaultOptions.network.connectToDiscv5Bootnodes === true),
        group: "network",
    },
    "network.discv5FirstQueryDelayMs": {
        type: "number",
        description: "Delay the 1st heart beat of Peer Manager after starting Discv5",
        defaultDescription: String(lodestar_1.defaultOptions.network.discv5FirstQueryDelayMs),
        group: "network",
    },
    "network.requestCountPeerLimit": {
        type: "number",
        description: "Max block req/resp requests per peer per rateTrackerTimeoutMs",
        hidden: true,
        defaultDescription: String(lodestar_1.defaultOptions.network.requestCountPeerLimit),
        group: "network",
    },
    "network.blockCountTotalLimit": {
        type: "number",
        description: "Max block count requested per rateTrackerTimeoutMs",
        hidden: true,
        defaultDescription: String(lodestar_1.defaultOptions.network.blockCountTotalLimit),
        group: "network",
    },
    "network.blockCountPeerLimit": {
        type: "number",
        description: "Max block count requested per peer per rateTrackerTimeoutMs",
        hidden: true,
        defaultDescription: String(lodestar_1.defaultOptions.network.blockCountPeerLimit),
        group: "network",
    },
    "network.rateTrackerTimeoutMs": {
        type: "number",
        description: "Time window to track rate limit in milli seconds",
        hidden: true,
        defaultDescription: String(lodestar_1.defaultOptions.network.rateTrackerTimeoutMs),
        group: "network",
    },
    "network.dontSendGossipAttestationsToForkchoice": {
        hidden: true,
        type: "boolean",
        description: "Pass gossip attestations to forkchoice or not",
        group: "network",
    },
};
//# sourceMappingURL=network.js.map