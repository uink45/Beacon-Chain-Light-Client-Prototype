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
exports.getInvalidTestcases = exports.getValidTestcases = exports.parseInvalidTestcase = exports.parseValidTestcase = void 0;
const node_path_1 = __importStar(require("node:path"));
const node_fs_1 = __importStar(require("node:fs"));
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const snappyjs_1 = require("snappyjs");
function parseValidTestcase(dirpath, type) {
    // The root is stored in meta.yml as:
    //   root: 0xDEADBEEF
    const metaStr = node_fs_1.default.readFileSync(node_path_1.default.join(dirpath, "meta.yaml"), "utf8");
    const meta = (0, lodestar_utils_1.loadYaml)(metaStr);
    if (typeof meta.root !== "string") {
        throw Error(`meta.root not a string: ${meta.root}\n${node_fs_1.default}`);
    }
    // The serialized value is stored in serialized.ssz_snappy
    const serialized = (0, snappyjs_1.uncompress)((0, node_fs_1.readFileSync)((0, node_path_1.join)(dirpath, "serialized.ssz_snappy")));
    // The value is stored in value.yml
    const yamlSnake = (0, lodestar_utils_1.loadYaml)(node_fs_1.default.readFileSync((0, node_path_1.join)(dirpath, "value.yaml"), "utf8"));
    const yamlCamel = (0, lodestar_utils_1.objectToExpectedCase)(yamlSnake, "camel");
    const value = type.fromJson(yamlCamel);
    return {
        root: meta.root,
        serialized,
        value,
    };
}
exports.parseValidTestcase = parseValidTestcase;
function parseInvalidTestcase(path) {
    // The serialized value is stored in serialized.ssz_snappy
    const serialized = (0, snappyjs_1.uncompress)((0, node_fs_1.readFileSync)((0, node_path_1.join)(path, "serialized.ssz_snappy")));
    return {
        path,
        serialized,
    };
}
exports.parseInvalidTestcase = parseInvalidTestcase;
function getValidTestcases(path, prefix, type) {
    const subdirs = (0, node_fs_1.readdirSync)(path);
    return subdirs
        .filter((dir) => dir.includes(prefix))
        .map((d) => (0, node_path_1.join)(path, d))
        .map((p) => parseValidTestcase(p, type));
}
exports.getValidTestcases = getValidTestcases;
function getInvalidTestcases(path, prefix) {
    const subdirs = (0, node_fs_1.readdirSync)(path);
    return subdirs
        .filter((dir) => dir.includes(prefix))
        .map((d) => (0, node_path_1.join)(path, d))
        .map(parseInvalidTestcase);
}
exports.getInvalidTestcases = getInvalidTestcases;
//# sourceMappingURL=sszGeneric.js.map