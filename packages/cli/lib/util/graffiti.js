"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultGraffiti = void 0;
const version_1 = require("./version");
const lodestarPackageName = "Lodestar";
/**
 * Computes a default graffiti fetching dynamically the package info.
 * @returns a string containing package name and version.
 */
function getDefaultGraffiti() {
    try {
        const version = (0, version_1.getVersion)();
        return `${lodestarPackageName}-${version}`;
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error guessing lodestar version", e);
        return lodestarPackageName;
    }
}
exports.getDefaultGraffiti = getDefaultGraffiti;
//# sourceMappingURL=graffiti.js.map