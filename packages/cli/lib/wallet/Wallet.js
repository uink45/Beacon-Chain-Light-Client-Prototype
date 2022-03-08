"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const lodash_1 = require("lodash");
const bls_1 = __importDefault(require("@chainsafe/bls"));
const bls_keystore_1 = require("@chainsafe/bls-keystore");
const bls_keygen_1 = require("@chainsafe/bls-keygen");
const util_1 = require("../util");
class Wallet extends bls_keystore_1.Keystore {
    constructor(keystore) {
        var _a, _b;
        super(keystore);
        this.name = keystore.name;
        this.nextaccount = (_a = keystore.nextaccount) !== null && _a !== void 0 ? _a : 0;
        this.version = (_b = keystore.version) !== null && _b !== void 0 ? _b : 1;
        this.type = keystore.type || "hierarchical deterministic";
    }
    /**
     * Creates a new builder for a seed specified as a BIP-39 `Mnemonic` (where the nmemonic itself does
     * not have a passphrase).
     */
    static async fromMnemonic(mnemonic, password, name) {
        const seed = (0, bls_keygen_1.deriveKeyFromMnemonic)(mnemonic);
        const publicKey = bls_1.default.SecretKey.fromBytes(seed).toPublicKey().toBytes();
        const wallet = new Wallet(await this.create(password, seed, publicKey, ""));
        wallet.name = name;
        wallet.nextaccount = 0;
        wallet.version = 1;
        wallet.type = "hierarchical deterministic";
        return wallet;
    }
    /**
     * Returns wallet data to write to disk as a parsed object
     */
    toWalletObject() {
        return {
            crypto: this.crypto,
            uuid: this.uuid,
            name: this.name || "",
            nextaccount: this.nextaccount,
            version: this.version,
            type: this.type,
        };
    }
    /**
     * Returns wallet data to write to disk as stringified JSON
     */
    toWalletJSON() {
        return JSON.stringify(this.toWalletObject());
    }
    /**
     * Produces a `Keystore` (encrypted with `keystore_password`) for the validator at
     * `self.nextaccount`, incrementing `self.nextaccount` if the keystore was successfully
     * generated.
     *
     * Uses the default encryption settings of `KeystoreBuilder`, not necessarily those that were
     * used to encrypt `this`.
     */
    async nextValidator(walletPassword, passwords) {
        const masterKey = await this.decrypt(walletPassword);
        const validatorIndex = this.nextaccount;
        const privKeys = (0, bls_keygen_1.deriveEth2ValidatorKeys)(masterKey, validatorIndex);
        const paths = (0, bls_keygen_1.eth2ValidatorPaths)(validatorIndex);
        const keystores = (0, lodash_1.mapValues)(privKeys, async (privKey, key) => {
            const type = key;
            const publicKey = bls_1.default.SecretKey.fromBytes(privKey).toPublicKey().toBytes();
            const keystore = await bls_keystore_1.Keystore.create(passwords[type], privKey, publicKey, paths[type]);
            return keystore;
        });
        // Update nextaccount last in case Keystore generation throws
        this.nextaccount += 1;
        const resolved = await Promise.all((0, lodash_1.values)(keystores));
        return {
            withdrawal: resolved[0],
            signing: resolved[1],
        };
    }
    /**
     * Utility function to generate passwords for the two eth2 pair keystores
     */
    randomPasswords() {
        return {
            signing: (0, util_1.randomPassword)(),
            withdrawal: (0, util_1.randomPassword)(),
        };
    }
}
exports.Wallet = Wallet;
//# sourceMappingURL=Wallet.js.map