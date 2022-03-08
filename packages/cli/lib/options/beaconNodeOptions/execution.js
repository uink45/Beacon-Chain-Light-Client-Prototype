"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.parseArgs = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const lodestar_1 = require("@chainsafe/lodestar");
const util_1 = require("../../util");
function parseArgs(args) {
    return {
        urls: args["execution.urls"],
        timeout: args["execution.timeout"],
        jwtSecretHex: args["jwt-secret"]
            ? (0, util_1.extractJwtHexSecret)(node_fs_1.default.readFileSync(args["jwt-secret"], "utf-8").trim())
            : undefined,
    };
}
exports.parseArgs = parseArgs;
exports.options = {
    "execution.urls": {
        description: "Urls to execution client engine API",
        type: "array",
        defaultDescription: lodestar_1.defaultOptions.executionEngine.mode === "http" ? lodestar_1.defaultOptions.executionEngine.urls.join(" ") : "",
        group: "execution",
    },
    "execution.timeout": {
        description: "Timeout in miliseconds for execution engine API HTTP client",
        type: "number",
        defaultDescription: lodestar_1.defaultOptions.executionEngine.mode === "http" ? String(lodestar_1.defaultOptions.executionEngine.timeout) : "",
        group: "execution",
    },
    "jwt-secret": {
        description: "File path to a shared hex-encoded jwt secret which will be used to generate and bundle HS256 encoded jwt tokens for authentication with the EL client's rpc server hosting engine apis. Secret to be exactly same as the one used by the corresponding EL client.",
        type: "string",
        group: "execution",
    },
};
//# sourceMappingURL=execution.js.map