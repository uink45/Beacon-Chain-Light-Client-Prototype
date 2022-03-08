"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalSignerUpCheck = exports.externalSignerPostSignature = exports.externalSignerGetKeys = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
/**
 * Return public keys from the server.
 */
async function externalSignerGetKeys(externalSignerUrl) {
    const res = await (0, cross_fetch_1.default)(`${externalSignerUrl}/keys`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const data = await handlerExternalSignerResponse(res);
    return data.keys;
}
exports.externalSignerGetKeys = externalSignerGetKeys;
/**
 * Return signature in bytes. Assumption that the pubkey has it's corresponding secret key in the keystore of an external signer.
 */
async function externalSignerPostSignature(externalSignerUrl, pubkeyHex, signingRootHex) {
    const res = await (0, cross_fetch_1.default)(`${externalSignerUrl}/sign/${pubkeyHex}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            signingRoot: signingRootHex,
        }),
    });
    const data = await handlerExternalSignerResponse(res);
    return data.signature;
}
exports.externalSignerPostSignature = externalSignerPostSignature;
/**
 * Return upcheck status from server.
 */
async function externalSignerUpCheck(remoteUrl) {
    const res = await (0, cross_fetch_1.default)(`${remoteUrl}/upcheck`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const data = await handlerExternalSignerResponse(res);
    return data.status === "OK";
}
exports.externalSignerUpCheck = externalSignerUpCheck;
async function handlerExternalSignerResponse(res) {
    if (!res.ok) {
        const errBody = await res.text();
        throw Error(`${errBody}`);
    }
    return JSON.parse(await res.text());
}
//# sourceMappingURL=externalSignerClient.js.map