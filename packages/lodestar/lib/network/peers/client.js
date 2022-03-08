"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientFromAgentVersion = exports.ClientKind = void 0;
var ClientKind;
(function (ClientKind) {
    ClientKind["Lighthouse"] = "Lighthouse";
    ClientKind["Nimbus"] = "Nimbus";
    ClientKind["Teku"] = "Teku";
    ClientKind["Prysm"] = "Prysm";
    ClientKind["Lodestar"] = "Lodestar";
    ClientKind["Unknown"] = "Unknown";
})(ClientKind = exports.ClientKind || (exports.ClientKind = {}));
function clientFromAgentVersion(agentVersion) {
    const slashIndex = agentVersion.indexOf("/");
    const agent = slashIndex >= 0 ? agentVersion.slice(0, slashIndex) : agentVersion;
    switch (agent.toLowerCase()) {
        case "lighthouse":
            return ClientKind.Lighthouse;
        case "teku":
            return ClientKind.Teku;
        case "prysm":
            return ClientKind.Prysm;
        case "nimbus":
            return ClientKind.Nimbus;
        case "js-libp2p":
            return ClientKind.Lodestar;
        default:
            return ClientKind.Unknown;
    }
}
exports.clientFromAgentVersion = clientFromAgentVersion;
//# sourceMappingURL=client.js.map