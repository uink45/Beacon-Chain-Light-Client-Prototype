"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLodestarCli = void 0;
// Must not use `* as yargs`, see https://github.com/yargs/yargs/issues/1131
const yargs_1 = __importDefault(require("yargs"));
const cmds_1 = require("./cmds");
const options_1 = require("./options");
const util_1 = require("./util");
const version_1 = require("./util/version");
const version = (0, version_1.getVersion)();
const topBanner = `🌟 Lodestar: TypeScript Implementation of the Ethereum 2.0 Beacon Chain.
  * Version: ${version}
  * by ChainSafe Systems, 2018-2022`;
const bottomBanner = `📖 For more information, check the CLI reference:
  * https://chainsafe.github.io/lodestar/reference/cli

✍️ Give feedback and report issues on GitHub:
  * https://github.com/ChainSafe/lodestar`;
/**
 * Common factory for running the CLI and running integration tests
 * The CLI must actually be executed in a different script
 */
function getLodestarCli() {
    const lodestar = yargs_1.default
        .env("LODESTAR")
        .parserConfiguration({
        // As of yargs v16.1.0 dot-notation breaks strictOptions()
        // Manually processing options is typesafe tho more verbose
        "dot-notation": false,
    })
        .options(options_1.globalOptions)
        // blank scriptName so that help text doesn't display the cli name before each command
        .scriptName("")
        .demandCommand(1)
        // Control show help behaviour below on .fail()
        .showHelpOnFail(false)
        .usage(topBanner)
        .epilogue(bottomBanner)
        .version(topBanner)
        .alias("h", "help")
        .alias("v", "version")
        .recommendCommands();
    // yargs.command and all ./cmds
    for (const cmd of cmds_1.cmds) {
        (0, util_1.registerCommandToYargs)(lodestar, cmd);
    }
    // throw an error if we see an unrecognized cmd
    lodestar.recommendCommands().strict();
    lodestar.config(...options_1.rcConfigOption);
    return lodestar;
}
exports.getLodestarCli = getLodestarCli;
//# sourceMappingURL=cli.js.map