"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEthersSigner = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const ethers_1 = require("ethers");
/**
 * Returns a connected ethers signer from a variety of provider options
 */
async function getEthersSigner({ keystorePath, keystorePassword, rpcUrl, rpcPassword, ipcPath, chainId, }) {
    if (keystorePath && keystorePassword) {
        const keystoreJson = node_fs_1.default.readFileSync(keystorePath, "utf8");
        const wallet = await ethers_1.ethers.Wallet.fromEncryptedJson(keystoreJson, keystorePassword);
        const eth1Provider = rpcUrl
            ? new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl)
            : new ethers_1.ethers.providers.InfuraProvider({ name: "deposit", chainId });
        return wallet.connect(eth1Provider);
    }
    if (rpcUrl) {
        const signer = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl).getSigner();
        if (rpcPassword) {
            await signer.unlock(rpcPassword);
        }
        return signer;
    }
    if (ipcPath) {
        return new ethers_1.ethers.providers.IpcProvider(ipcPath).getSigner();
    }
    throw Error("Must supply either keystorePath, rpcUrl, or ipcPath");
}
exports.getEthersSigner = getEthersSigner;
//# sourceMappingURL=ethers.js.map