"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectResponses = void 0;
const types_1 = require("../types");
const errors_1 = require("./errors");
/**
 * Sink for `<response_chunk>*`, from
 * ```bnf
 * response ::= <response_chunk>*
 * ```
 * Note: `response` has zero or more chunks for SSZ-list responses or exactly one chunk for non-list
 */
function collectResponses(method, maxResponses) {
    return async (source) => {
        if (types_1.isSingleResponseChunkByMethod[method]) {
            for await (const response of source) {
                return response;
            }
            throw new errors_1.RequestInternalError({ code: errors_1.RequestErrorCode.EMPTY_RESPONSE });
        }
        // else: zero or more responses
        const responses = [];
        for await (const response of source) {
            responses.push(response);
            if (maxResponses !== undefined && responses.length >= maxResponses) {
                break;
            }
        }
        return responses;
    };
}
exports.collectResponses = collectResponses;
//# sourceMappingURL=collectResponses.js.map