"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWalletFromArgsAndMnemonic = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const util_1 = require("../../../../util");
const wallet_1 = require("../../../../wallet");
const paths_1 = require("../../paths");
async function createWalletFromArgsAndMnemonic(args, mnemonic) {
    const { name, type, passphraseFile, mnemonicOutputPath } = args;
    const accountPaths = (0, paths_1.getAccountPaths)(args);
    if (node_path_1.default.parse(passphraseFile).ext !== ".pass") {
        throw new util_1.YargsError("passphraseFile must end with .pass, make sure to not provide the actual password");
    }
    if (!node_fs_1.default.existsSync(passphraseFile)) {
        (0, util_1.writeFile600Perm)(passphraseFile, (0, util_1.randomPassword)());
    }
    const password = (0, util_1.readPassphraseFile)(passphraseFile);
    const walletManager = new wallet_1.WalletManager(accountPaths);
    const wallet = await walletManager.createWallet(name, type, mnemonic, password);
    const uuid = wallet.toWalletObject().uuid;
    if (mnemonicOutputPath) {
        (0, util_1.writeFile600Perm)(mnemonicOutputPath, mnemonic);
    }
    return { uuid, password };
}
exports.createWalletFromArgsAndMnemonic = createWalletFromArgsAndMnemonic;
//# sourceMappingURL=utils.js.map