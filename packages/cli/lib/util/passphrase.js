"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeValidatorPassphrase = exports.readValidatorPassphrase = exports.readPassphraseFile = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const stripOffNewlines_1 = require("./stripOffNewlines");
const fs_1 = require("./fs");
const paths_1 = require("../validatorDir/paths");
/**
 * Utility to read file as UTF8 and strip any trailing new lines.
 * All passphrase files must be read with this function
 */
function readPassphraseFile(passphraseFile) {
    const data = node_fs_1.default.readFileSync(passphraseFile, "utf8");
    const passphrase = (0, stripOffNewlines_1.stripOffNewlines)(data);
    // Validate the passphraseFile contents to prevent the user to create a wallet with a password
    // that is the contents a random unintended file
    try {
        if (passphrase.includes("\n"))
            throw Error("contains multiple lines");
        // 512 is an arbitrary high number that should be longer than any actual passphrase
        if (passphrase.length > 512)
            throw Error("is really long");
    }
    catch (e) {
        throw new Error(`passphraseFile ${passphraseFile} ${e.message}. Is this a well-formated passphraseFile?`);
    }
    return passphrase;
}
exports.readPassphraseFile = readPassphraseFile;
function readValidatorPassphrase({ secretsDir, pubkey }) {
    const notPrefixedPath = (0, paths_1.getValidatorPassphrasePath)({ secretsDir, pubkey });
    const prefixedPath = (0, paths_1.getValidatorPassphrasePath)({ secretsDir, pubkey, prefixed: true });
    if (node_fs_1.default.existsSync(notPrefixedPath)) {
        return readPassphraseFile(notPrefixedPath);
    }
    else {
        return readPassphraseFile(prefixedPath);
    }
}
exports.readValidatorPassphrase = readValidatorPassphrase;
function writeValidatorPassphrase({ secretsDir, pubkey, passphrase, }) {
    (0, fs_1.writeFile600Perm)((0, paths_1.getValidatorPassphrasePath)({ secretsDir, pubkey, prefixed: true }), passphrase);
}
exports.writeValidatorPassphrase = writeValidatorPassphrase;
//# sourceMappingURL=passphrase.js.map