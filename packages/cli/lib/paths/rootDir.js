"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultRootDir = void 0;
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
/**
 * Follows XDG Base Directory Specification
 * https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html#basics
 */
function getDefaultRootDir(network) {
    const dataHome = process.env.XDG_DATA_HOME || node_path_1.default.join(node_os_1.default.homedir(), ".local", "share");
    return node_path_1.default.join(dataHome, "lodestar", network || "mainnet");
}
exports.getDefaultRootDir = getDefaultRootDir;
//# sourceMappingURL=rootDir.js.map