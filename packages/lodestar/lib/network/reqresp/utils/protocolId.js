"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseProtocolId = exports.formatProtocolId = void 0;
const types_1 = require("../types");
const methods = new Set(Object.values(types_1.Method));
const versions = new Set(Object.values(types_1.Version));
const encodings = new Set(Object.values(types_1.Encoding));
/** Render protocol ID */
function formatProtocolId(method, version, encoding) {
    return `${types_1.protocolPrefix}/${method}/${version}/${encoding}`;
}
exports.formatProtocolId = formatProtocolId;
function parseProtocolId(protocolId) {
    if (!protocolId.startsWith(types_1.protocolPrefix)) {
        throw Error(`Unknown protocolId prefix: ${protocolId}`);
    }
    // +1 for the first "/"
    const suffix = protocolId.slice(types_1.protocolPrefix.length + 1);
    const [method, version, encoding] = suffix.split("/");
    if (!method || !methods.has(method))
        throw Error(`Unknown protocolId method ${method}`);
    if (!version || !versions.has(version))
        throw Error(`Unknown protocolId version ${version}`);
    if (!encoding || !encodings.has(encoding))
        throw Error(`Unknown protocolId encoding ${encoding}`);
    return { method, version, encoding };
}
exports.parseProtocolId = parseProtocolId;
//# sourceMappingURL=protocolId.js.map