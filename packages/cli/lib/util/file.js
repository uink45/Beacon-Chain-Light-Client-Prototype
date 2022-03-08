"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadOrLoadFile = exports.downloadFile = exports.downloadOrCopyFile = exports.readFileIfExists = exports.readFile = exports.writeFile = exports.stringify = exports.parse = exports.FileFormat = exports.mkdir = exports.yamlSchema = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_stream_1 = __importDefault(require("node:stream"));
const node_util_1 = require("node:util");
const got_1 = __importDefault(require("got"));
const js_yaml_1 = require("js-yaml");
exports.yamlSchema = new js_yaml_1.Schema({
    include: [js_yaml_1.FAILSAFE_SCHEMA],
    implicit: [
        new js_yaml_1.Type("tag:yaml.org,2002:str", {
            kind: "scalar",
            construct: function construct(data) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return data !== null ? data : "";
            },
        }),
    ],
});
/**
 * Maybe create a directory
 */
function mkdir(dirname) {
    node_fs_1.default.mkdirSync(dirname, { recursive: true });
}
exports.mkdir = mkdir;
var FileFormat;
(function (FileFormat) {
    FileFormat["json"] = "json";
    FileFormat["yaml"] = "yaml";
    FileFormat["yml"] = "yml";
    FileFormat["toml"] = "toml";
})(FileFormat = exports.FileFormat || (exports.FileFormat = {}));
/**
 * Parse file contents as Json.
 */
function parse(contents, fileFormat) {
    switch (fileFormat) {
        case FileFormat.json:
            return JSON.parse(contents);
        case FileFormat.yaml:
        case FileFormat.yml:
            return (0, js_yaml_1.load)(contents, { schema: exports.yamlSchema });
        default:
            return contents;
    }
}
exports.parse = parse;
/**
 * Stringify file contents.
 */
function stringify(obj, fileFormat) {
    let contents;
    switch (fileFormat) {
        case FileFormat.json:
            contents = JSON.stringify(obj, null, 2);
            break;
        case FileFormat.yaml:
        case FileFormat.yml:
            contents = (0, js_yaml_1.dump)(obj, { schema: exports.yamlSchema });
            break;
        default:
            contents = obj;
    }
    return contents;
}
exports.stringify = stringify;
/**
 * Write a JSON serializable object to a file
 *
 * Serialize either to json, yaml, or toml
 */
function writeFile(filepath, obj) {
    mkdir(node_path_1.default.dirname(filepath));
    const fileFormat = node_path_1.default.extname(filepath).substr(1);
    node_fs_1.default.writeFileSync(filepath, stringify(obj, fileFormat), "utf-8");
}
exports.writeFile = writeFile;
/**
 * Read a JSON serializable object from a file
 *
 * Parse either from json, yaml, or toml
 * Optional acceptedFormats object can be passed which can be an array of accepted formats, in future can be extended to include parseFn for the accepted formats
 */
function readFile(filepath, acceptedFormats) {
    const fileFormat = node_path_1.default.extname(filepath).substr(1);
    if (acceptedFormats && !acceptedFormats.includes(fileFormat))
        throw new Error(`UnsupportedFileFormat: ${filepath}`);
    const contents = node_fs_1.default.readFileSync(filepath, "utf-8");
    return parse(contents, fileFormat);
}
exports.readFile = readFile;
/**
 * @see readFile
 * If `filepath` does not exist returns null
 */
function readFileIfExists(filepath, acceptedFormats) {
    try {
        return readFile(filepath, acceptedFormats);
    }
    catch (e) {
        if (e.code === "ENOENT") {
            return null;
        }
        else {
            throw e;
        }
    }
}
exports.readFileIfExists = readFileIfExists;
/**
 * Download from URL or copy from local filesystem
 * @param urlOrPathSrc "/path/to/file.szz" | "https://url.to/file.szz"
 */
async function downloadOrCopyFile(pathDest, urlOrPathSrc) {
    if (isUrl(urlOrPathSrc)) {
        await downloadFile(pathDest, urlOrPathSrc);
    }
    else {
        mkdir(node_path_1.default.dirname(pathDest));
        await node_fs_1.default.promises.copyFile(urlOrPathSrc, pathDest);
    }
}
exports.downloadOrCopyFile = downloadOrCopyFile;
/**
 * Downloads a genesis file per network if it does not exist
 */
async function downloadFile(pathDest, url) {
    if (!node_fs_1.default.existsSync(pathDest)) {
        mkdir(node_path_1.default.dirname(pathDest));
        await (0, node_util_1.promisify)(node_stream_1.default.pipeline)(got_1.default.stream(url), node_fs_1.default.createWriteStream(pathDest));
    }
}
exports.downloadFile = downloadFile;
/**
 * Download from URL to memory or load from local filesystem
 * @param urlOrPathSrc "/path/to/file.szz" | "https://url.to/file.szz"
 */
async function downloadOrLoadFile(pathOrUrl) {
    if (isUrl(pathOrUrl)) {
        const res = await got_1.default.get(pathOrUrl, { encoding: "binary" });
        return res.rawBody;
    }
    else {
        return await node_fs_1.default.promises.readFile(pathOrUrl);
    }
}
exports.downloadOrLoadFile = downloadOrLoadFile;
/**
 * Returns boolean for whether the string is a URL.
 */
function isUrl(pathOrUrl) {
    return pathOrUrl.startsWith("http");
}
//# sourceMappingURL=file.js.map