"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAccountPaths = exports.getAccountPaths = void 0;
const node_path_1 = __importDefault(require("node:path"));
const global_1 = require("../../paths/global");
/**
 * Defines the path structure of the account files
 *
 * ```bash
 * $accountsRootDir
 * ├── secrets
 * |   ├── 0x8e41b969493454318c27ec6fac90645769331c07ebc8db5037...
 * |   └── 0xa329f988c16993768299643d918a2694892c012765d896a16f...
 * ├── keystores
 * |   ├── 0x8e41b969493454318c27ec6fac90645769331c07ebc8db5037...
 * |   |   ├── eth1-deposit-data.rlp
 * |   |   ├── eth1-deposit-gwei.txt
 * |   |   └── voting-keystore.json
 * |   └── 0xa329f988c16993768299643d918a2694892c012765d896a16f...
 * |       ├── eth1-deposit-data.rlp
 * |       ├── eth1-deposit-gwei.txt
 * |       └── voting-keystore.json
 * ├── wallet1.pass (arbitrary path)
 * └── wallets
 *     └── 96ae14b4-46d7-42dc-afd8-c782e9af87ef (dir)
 *         └── 96ae14b4-46d7-42dc-afd8-c782e9af87ef (json)
 * ```
 */
// Using Pick<IGlobalArgs, "rootDir"> make changes in IGlobalArgs throw a type error here
function getAccountPaths(args) {
    // Compute global paths first
    const globalPaths = (0, global_1.getGlobalPaths)(args);
    const rootDir = globalPaths.rootDir;
    const keystoresDir = args.keystoresDir || node_path_1.default.join(rootDir, "keystores");
    const secretsDir = args.secretsDir || node_path_1.default.join(rootDir, "secrets");
    const walletsDir = args.walletsDir || node_path_1.default.join(rootDir, "wallets");
    return {
        ...globalPaths,
        keystoresDir,
        secretsDir,
        walletsDir,
    };
}
exports.getAccountPaths = getAccountPaths;
/**
 * Constructs representations of the path structure to show in command's description
 */
exports.defaultAccountPaths = getAccountPaths({ rootDir: "$rootDir" });
//# sourceMappingURL=paths.js.map