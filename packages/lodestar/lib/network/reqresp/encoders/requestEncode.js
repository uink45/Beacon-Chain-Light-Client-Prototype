"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestEncode = void 0;
const types_1 = require("../types");
const encodingStrategies_1 = require("../encodingStrategies");
/**
 * Yields byte chunks for a `<request>`
 * ```bnf
 * request  ::= <encoding-dependent-header> | <encoded-payload>
 * ```
 * Requests may contain no payload (e.g. /eth2/beacon_chain/req/metadata/1/)
 * if so, it would yield no byte chunks
 */
async function* requestEncode(protocol, requestBody) {
    const type = (0, types_1.getRequestSzzTypeByMethod)(protocol.method);
    if (type && requestBody !== null) {
        yield* (0, encodingStrategies_1.writeEncodedPayload)(requestBody, protocol.encoding, type);
    }
}
exports.requestEncode = requestEncode;
//# sourceMappingURL=requestEncode.js.map