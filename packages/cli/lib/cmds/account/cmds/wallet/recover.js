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
const utils_1 = require("./utils");
const create_1 = require("./create");
exports.recover = {
    command: "recover",
    describe: "Recovers an EIP-2386 wallet from a given a BIP-39 mnemonic phrase.",
    examples: [
        {
            command: "account wallet recover",
            description: "Recover wallet",
        },
    ],
    options: {
        ...create_1.walletCreateOptions,
        mnemonicInputPath: {
            description: "If present, the mnemonic will be read in from this file.",
            type: "string",
        },
    },
    handler: async (args) => {
        await (0, util_1.initBLS)();
        const { mnemonicInputPath } = args;
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
        const { uuid } = await (0, utils_1.createWalletFromArgsAndMnemonic)(args, mnemonic);
        console.log(`Your wallet has been successfully recovered.
Your wallet's UUID is:

\t${uuid}

You do not need to backup your UUID or keep it secret.
`);
        return [uuid];
    },
};
//# sourceMappingURL=recover.js.map