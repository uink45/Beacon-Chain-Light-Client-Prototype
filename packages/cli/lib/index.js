#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const util_1 = require("./util");
const cli_1 = require("./cli");
require("source-map-support/register");
const lodestar = (0, cli_1.getLodestarCli)();
lodestar
    .fail((msg, err) => {
    if (msg) {
        // Show command help message when no command is provided
        if (msg.includes("Not enough non-option arguments")) {
            yargs_1.default.showHelp();
            // eslint-disable-next-line no-console
            console.log("\n");
        }
    }
    const errorMessage = err !== undefined ? (err instanceof util_1.YargsError ? err.message : err.stack) : msg || "Unknown error";
    // eslint-disable-next-line no-console
    console.error(` ✖ ${errorMessage}\n`);
    process.exit(1);
})
    // Execute CLI
    .parse();
//# sourceMappingURL=index.js.map