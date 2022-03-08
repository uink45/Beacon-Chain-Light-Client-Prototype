"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractJwtHexSecret = void 0;
function extractJwtHexSecret(jwtSecretContents) {
    var _a;
    const hexPattern = new RegExp(/^(0x|0X)?(?<jwtSecret>[a-fA-F0-9]+)$/, "g");
    const jwtSecretHexMatch = hexPattern.exec(jwtSecretContents);
    const jwtSecret = (_a = jwtSecretHexMatch === null || jwtSecretHexMatch === void 0 ? void 0 : jwtSecretHexMatch.groups) === null || _a === void 0 ? void 0 : _a.jwtSecret;
    if (!jwtSecret || jwtSecret.length != 64) {
        throw Error(`Need a valid 256 bit hex encoded secret ${jwtSecret} ${jwtSecretContents}`);
    }
    // Return the secret in proper hex format
    return `0x${jwtSecret}`;
}
exports.extractJwtHexSecret = extractJwtHexSecret;
//# sourceMappingURL=jwt.js.map