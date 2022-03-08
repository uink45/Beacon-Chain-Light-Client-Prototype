"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryParseProofPaths = exports.queryParseProofPathsArr = exports.querySerializeProofPathsArr = void 0;
/**
 * Serialize proof path to JSON.
 * @param paths `[["finalized_checkpoint", 0, "root", 12000]]`
 * @returns `['["finalized_checkpoint",0,"root",12000]']`
 */
function querySerializeProofPathsArr(paths) {
    return paths.map((path) => JSON.stringify(path));
}
exports.querySerializeProofPathsArr = querySerializeProofPathsArr;
/**
 * Deserialize JSON proof path to proof path
 * @param pathStrs `['["finalized_checkpoint",0,"root",12000]']`
 * @returns `[["finalized_checkpoint", 0, "root", 12000]]`
 */
function queryParseProofPathsArr(pathStrs) {
    if (Array.isArray(pathStrs)) {
        return pathStrs.map((pathStr) => queryParseProofPaths(pathStr));
    }
    else {
        return [queryParseProofPaths(pathStrs)];
    }
}
exports.queryParseProofPathsArr = queryParseProofPathsArr;
/**
 * Deserialize single JSON proof path to proof path
 * @param pathStr `'["finalized_checkpoint",0,"root",12000]'`
 * @returns `["finalized_checkpoint", 0, "root", 12000]`
 */
function queryParseProofPaths(pathStr) {
    const path = JSON.parse(pathStr);
    if (!Array.isArray(path)) {
        throw Error("Proof pathStr is not an array");
    }
    for (let i = 0; i < path.length; i++) {
        const elType = typeof path[i];
        if (elType !== "string" && elType !== "number") {
            throw Error(`Proof pathStr[${i}] not string or number`);
        }
    }
    return path;
}
exports.queryParseProofPaths = queryParseProofPaths;
//# sourceMappingURL=serdes.js.map