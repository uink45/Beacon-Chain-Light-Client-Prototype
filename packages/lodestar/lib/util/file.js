"use strict";
/**
 * @module util/file
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rmDir = exports.ensureDirectoryExistence = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
/**
 * Recursively ensures directory exists by creating any missing directories
 * @param {string} filePath
 */
function ensureDirectoryExistence(filePath) {
    const dirname = node_path_1.default.dirname(filePath);
    if (node_fs_1.default.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    node_fs_1.default.mkdirSync(dirname);
    return true;
}
exports.ensureDirectoryExistence = ensureDirectoryExistence;
function rmDir(dir) {
    const list = node_fs_1.default.readdirSync(dir);
    for (let i = 0; i < list.length; i++) {
        const filename = node_path_1.default.join(dir, list[i]);
        const stat = node_fs_1.default.statSync(filename);
        if (filename == "." || filename == "..") {
            // pass these files
        }
        else if (stat.isDirectory()) {
            // rmdir recursively
            rmDir(filename);
        }
        else {
            // rm fiilename
            node_fs_1.default.unlinkSync(filename);
        }
    }
    node_fs_1.default.rmdirSync(dir);
}
exports.rmDir = rmDir;
//# sourceMappingURL=file.js.map