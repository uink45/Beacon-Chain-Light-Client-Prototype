"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestDecode = void 0;
const types_1 = require("../types");
const utils_1 = require("../utils");
const encodingStrategies_1 = require("../encodingStrategies");
/**
 * Consumes a stream source to read a `<request>`
 * ```bnf
 * request  ::= <encoding-dependent-header> | <encoded-payload>
 * ```
 */
function requestDecode(protocol) {
    return async function requestDecodeSink(source) {
        const type = (0, types_1.getRequestSzzTypeByMethod)(protocol.method);
        if (!type) {
            // method has no body
            return null;
        }
        // Request has a single payload, so return immediately
        const bufferedSource = new utils_1.BufferedSource(source);
        return await (0, encodingStrategies_1.readEncodedPayload)(bufferedSource, protocol.encoding, type);
    };
}
exports.requestDecode = requestDecode;
//# sourceMappingURL=requestDecode.js.map