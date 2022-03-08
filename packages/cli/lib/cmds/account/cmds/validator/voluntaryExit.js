"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voluntaryExit = void 0;
const lodestar_validator_1 = require("@chainsafe/lodestar-validator");
const lodestar_validator_2 = require("@chainsafe/lodestar-validator");
const node_fs_1 = require("node:fs");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const inquirer_1 = __importDefault(require("inquirer"));
const util_1 = require("../../../../util");
const validatorDir_1 = require("../../../../validatorDir");
const paths_1 = require("../../paths");
const config_1 = require("../../../../config");
const logger_1 = require("../../../../util/logger");
const options_1 = require("../../../validator/options");
const paths_2 = require("../../../validator/paths");
exports.voluntaryExit = {
    command: "voluntary-exit",
    describe: "Performs a voluntary exit for a given validator (as identified via `publicKey`.  \
If no `publicKey` is provided, a prompt will ask the user which validator they would \
like to choose for the voluntary exit.",
    examples: [
        {
            command: "account validator voluntary-exit --publicKey 0xF00",
            description: "Perform a voluntary exit for the validator who has a public key 0xF00",
        },
    ],
    options: {
        ...options_1.validatorOptions,
        publicKey: {
            description: "The public key of the validator to voluntarily exit",
            type: "string",
        },
        exitEpoch: {
            description: "The epoch upon which to submit the voluntary exit.  If no value is provided, then we default to the currentEpoch.",
            type: "number",
        },
    },
    handler: async (args) => {
        await (0, util_1.initBLS)();
        const force = args.force;
        let publicKey = args.publicKey;
        const accountPaths = (0, paths_1.getAccountPaths)(args);
        const validatorDirManager = new validatorDir_1.ValidatorDirManager(accountPaths);
        if (!publicKey) {
            const publicKeys = (0, node_fs_1.readdirSync)(accountPaths.keystoresDir);
            const validator = await inquirer_1.default.prompt([
                {
                    name: "publicKey",
                    type: "list",
                    message: "Which validator do you want to voluntarily exit from the network?",
                    choices: [...publicKeys],
                },
            ]);
            publicKey = validator.publicKey;
        }
        const confirmation = await inquirer_1.default.prompt([
            {
                name: "choice",
                type: "list",
                message: `Are you sure you want to permantently exit validator ${publicKey} from the ${args.network} network?

WARNING: THIS CANNOT BE UNDONE.

ONCE YOU VOLUNTARILY EXIT, YOU WILL NOT BE ABLE TO WITHDRAW
YOUR DEPOSIT UNTIL PHASE 2 IS LAUNCHED WHICH MAY NOT
BE UNTIL AT LEAST TWO YEARS AFTER THE PHASE 0 MAINNET LAUNCH.

`,
                choices: ["NO", "YES"],
            },
        ]);
        if (confirmation.choice === "NO")
            return;
        console.log(`Initiating voluntary exit for validator ${publicKey}`);
        const secretKey = await validatorDirManager.decryptValidator(publicKey, { force });
        console.log(`Decrypted keystore for validator ${publicKey}`);
        const validatorPaths = (0, paths_2.getValidatorPaths)(args);
        const dbPath = validatorPaths.validatorsDbDir;
        const config = (0, config_1.getBeaconConfigFromArgs)(args);
        const logger = (0, logger_1.errorLogger)();
        const dbOps = {
            config,
            controller: new lodestar_db_1.LevelDbController({ name: dbPath }, { logger }),
        };
        const slashingProtection = new lodestar_validator_1.SlashingProtection(dbOps);
        const validatorClient = await lodestar_validator_1.Validator.initializeFromBeaconNode({
            slashingProtection,
            dbOps,
            api: args.server,
            signers: [{ type: lodestar_validator_2.SignerType.Local, secretKey }],
            logger: (0, logger_1.errorLogger)(),
            graffiti: args.graffiti,
        });
        await validatorClient.voluntaryExit(publicKey, args.exitEpoch);
    },
};
//# sourceMappingURL=voluntaryExit.js.map