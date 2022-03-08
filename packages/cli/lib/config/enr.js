"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overwriteEnrWithCliArgs = exports.initEnr = exports.readEnr = exports.writeEnr = exports.createEnr = void 0;
const multiaddr_1 = require("multiaddr");
const discv5_1 = require("@chainsafe/discv5");
const util_1 = require("../util");
const fileEnr_1 = require("./fileEnr");
function createEnr(peerId) {
    const keypair = (0, discv5_1.createKeypairFromPeerId)(peerId);
    return discv5_1.ENR.createV4(keypair.publicKey);
}
exports.createEnr = createEnr;
function writeEnr(filepath, enr, peerId) {
    const keypair = (0, discv5_1.createKeypairFromPeerId)(peerId);
    (0, util_1.writeFile)(filepath, enr.encodeTxt(keypair.privateKey));
}
exports.writeEnr = writeEnr;
function readEnr(filepath) {
    return discv5_1.ENR.decodeTxt((0, util_1.readFile)(filepath));
}
exports.readEnr = readEnr;
function initEnr(filepath, peerId) {
    fileEnr_1.FileENR.initFromENR(filepath, peerId, createEnr(peerId)).saveToFile();
}
exports.initEnr = initEnr;
function overwriteEnrWithCliArgs(enr, enrArgs, options) {
    var _a;
    if (options.network.localMultiaddrs.length) {
        try {
            const tcpOpts = new multiaddr_1.Multiaddr(options.network.localMultiaddrs[0]).toOptions();
            if (tcpOpts.transport === "tcp") {
                enr.tcp = tcpOpts.port;
            }
        }
        catch (e) {
            throw new Error(`Invalid tcp multiaddr: ${e.message}`);
        }
    }
    if ((_a = options.network.discv5) === null || _a === void 0 ? void 0 : _a.bindAddr) {
        try {
            const udpOpts = new multiaddr_1.Multiaddr(options.network.localMultiaddrs[0]).toOptions();
            if (udpOpts.transport === "udp") {
                enr.udp = udpOpts.port;
            }
        }
        catch (e) {
            throw new Error(`Invalid udp multiaddr: ${e.message}`);
        }
    }
    if (enrArgs.ip != null)
        enr.ip = enrArgs.ip;
    if (enrArgs.tcp != null)
        enr.tcp = enrArgs.tcp;
    if (enrArgs.udp != null)
        enr.udp = enrArgs.udp;
    if (enrArgs.ip6 != null)
        enr.ip6 = enrArgs.ip6;
    if (enrArgs.tcp6 != null)
        enr.tcp6 = enrArgs.tcp6;
    if (enrArgs.udp6 != null)
        enr.udp6 = enrArgs.udp6;
}
exports.overwriteEnrWithCliArgs = overwriteEnrWithCliArgs;
//# sourceMappingURL=enr.js.map