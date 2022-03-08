"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recover = void 0;
const fs = __importStar(require("node:fs"));
const util_1 = require("../../../../util");
const inquirer_1 = __importDefault(require("inquirer"));
const bip39_1 = require("bip39");
const validatorDir_1 = require("../../../../validatorDir");
const paths_1 = require("../../paths");
const bls_keygen_1 = require("@chainsafe/bls-keygen");
const create_1 = require("./create");
const lodash_1 = require("lodash");
const bls_1 = __importDefault(require("@chainsafe/bls"));
const bls_keystore_1 = require("@chainsafe/bls-keystore");
const config_1 = require("../../../../config");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
exports.recover = {
    command: "recover",
    describe: "Recovers validator private keys given a BIP-39 mnemonic phrase. \
  If you did not specify a `--firstIndex` or count `--count`, by default this will \
  only recover the keys associated with the validator at index 0 for an HD wallet \
  in accordance with the EIP-2333 spec.",
    examples: [
        {
            command: "account validator recover",
            description: "Recover validator",
        },
    ],
    options: {
        count: create_1.validatorCreateOptions.count,
        depositGwei: create_1.validatorCreateOptions.depositGwei,
        storeWithdrawalKeystore: create_1.validatorCreateOptions.storeWithdrawalKeystore,
        mnemonicInputPath: {
            description: "If present, the mnemonic will be read in from this file.",
            type: "string",
        },
        firstIndex: {
            default: 0,
            description: "The first of consecutive key indexes you wish to recover.",
            type: "number",
        },
    },
    handler: async (args) => {
        await (0, util_1.initBLS)();
        const config = (0, config_1.getBeaconConfigFromArgs)(args);
        const { mnemonicInputPath, count, storeWithdrawalKeystore, firstIndex } = args;
        const maxEffectiveBalance = lodestar_params_1.MAX_EFFECTIVE_BALANCE;
        const depositGwei = Number(args.depositGwei || 0) || maxEffectiveBalance;
        let mnemonic;
        console.log("\nWARNING: KEY RECOVERY CAN LEAD TO DUPLICATING VALIDATORS KEYS, WHICH CAN LEAD TO SLASHING.\n");
        if (mnemonicInputPath) {
            mnemonic = fs.readFileSync(mnemonicInputPath, "utf8").trim();
        }
        else {
            const input = await inquirer_1.default.prompt([
                {
                    name: "mnemonic",
                    type: "input",
                    message: "Enter the mnemonic phrase:",
                },
            ]);
            mnemonic = input.mnemonic;
        }
        const isValid = (0, bip39_1.validateMnemonic)(mnemonic);
        if (!isValid) {
            throw new Error("not a valid mnemonic");
        }
        const masterSK = (0, bls_keygen_1.deriveKeyFromMnemonic)(mnemonic);
        const accountPaths = (0, paths_1.getAccountPaths)(args);
        const validatorDirBuilder = new validatorDir_1.ValidatorDirBuilder(accountPaths);
        const pubkeys = [];
        for (let i = firstIndex; i < count; i++) {
            const signing = (0, util_1.randomPassword)();
            const withdrawal = (0, util_1.randomPassword)();
            const passwords = { signing, withdrawal };
            const privKeys = (0, bls_keygen_1.deriveEth2ValidatorKeys)(masterSK, i);
            const paths = (0, bls_keygen_1.eth2ValidatorPaths)(i);
            const keystoreRequests = (0, lodash_1.mapValues)(privKeys, async (privKey, key) => {
                const type = key;
                const publicKey = bls_1.default.SecretKey.fromBytes(privKey).toPublicKey().toBytes();
                const keystore = await bls_keystore_1.Keystore.create(passwords[type], privKey, publicKey, paths[type]);
                return keystore;
            });
            const keystores = await Promise.all((0, lodash_1.values)(keystoreRequests));
            await validatorDirBuilder.build({
                keystores: {
                    withdrawal: keystores[0],
                    signing: keystores[1],
                },
                passwords,
                storeWithdrawalKeystore,
                depositGwei,
                config,
            });
            const pubkey = (0, util_1.add0xPrefix)(keystores[1].pubkey);
            console.log(`${i}/${count}\t${pubkey}`);
            pubkeys.push(pubkey);
        }
        // Return values for testing
        return pubkeys;
    },
};
//# sourceMappingURL=recover.js.map