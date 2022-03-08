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
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.walletCreateOptions = exports.description = exports.command = void 0;
const bip39 = __importStar(require("bip39"));
const util_1 = require("../../../../util");
const options_1 = require("./options");
const utils_1 = require("./utils");
exports.command = "create";
exports.description = "Creates a new HD (hierarchical-deterministic) EIP-2386 wallet";
exports.walletCreateOptions = {
    ...options_1.accountWalletsOptions,
    name: {
        description: "The wallet will be created with this name. It is not allowed to \
create two wallets with the same name for the same --base-dir.",
        alias: ["n"],
        demandOption: true,
        type: "string",
    },
    passphraseFile: {
        description: "A path to a file containing the password which will unlock the wallet. \
If the file does not exist, a random password will be generated and saved at that \
path. To avoid confusion, if the file does not already exist it must include a \
'.pass' suffix.",
        alias: ["p"],
        demandOption: true,
        type: "string",
    },
    type: {
        description: "The type of wallet to create. Only HD (hierarchical-deterministic) \
wallets are supported presently.",
        choices: ["hd"],
        default: "hd",
        type: "string",
    },
    mnemonicOutputPath: {
        description: "If present, the mnemonic will be saved to this file",
        type: "string",
    },
};
exports.create = {
    command: "create",
    describe: "Creates a new HD (hierarchical-deterministic) EIP-2386 wallet",
    examples: [
        {
            command: "account wallet create --name primary --passphraseFile primary.pass",
            description: "Create an HD wallet named 'primary'",
        },
    ],
    options: exports.walletCreateOptions,
    handler: async (args) => {
        await (0, util_1.initBLS)();
        // Create a new random mnemonic.
        const mnemonic = bip39.generateMnemonic();
        const { uuid, password } = await (0, utils_1.createWalletFromArgsAndMnemonic)(args, mnemonic);
        // eslint-disable-next-line no-console
        console.log(`
  Your wallet's 12-word BIP-39 mnemonic is:

  \t${mnemonic}

  This mnemonic can be used to fully restore your wallet, should 
  you lose the JSON file or your password. 

  It is very important that you DO NOT SHARE this mnemonic as it will 
  reveal the private keys of all validators and keys generated with
  this wallet. That would be catastrophic.

  It is also important to store a backup of this mnemonic so you can 
  recover your private keys in the case of data loss. Writing it on 
  a piece of paper and storing it in a safe place would be prudent.

  Your wallet's UUID is:

  \t${uuid}

  You do not need to backup your UUID or keep it secret.`);
        // Return values for testing
        return { mnemonic, uuid, password };
    },
};
//# sourceMappingURL=create.js.map