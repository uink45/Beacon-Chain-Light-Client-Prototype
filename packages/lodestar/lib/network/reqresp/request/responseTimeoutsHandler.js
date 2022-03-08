"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseTimeoutsHandler = exports.maxTotalResponseTimeout = void 0;
const abort_controller_1 = require("@chainsafe/abort-controller");
const it_pipe_1 = __importDefault(require("it-pipe"));
const constants_1 = require("../../../constants");
const abortableSource_1 = require("../../../util/abortableSource");
const utils_1 = require("../utils");
const errors_1 = require("./errors");
/** Returns the maximum total timeout possible for a response. See @responseTimeoutsHandler */
function maxTotalResponseTimeout(maxResponses = 1, options) {
    const { TTFB_TIMEOUT, RESP_TIMEOUT } = { ...constants_1.timeoutOptions, ...options };
    return TTFB_TIMEOUT + maxResponses * RESP_TIMEOUT;
}
exports.maxTotalResponseTimeout = maxTotalResponseTimeout;
/**
 * Wraps responseDecoder to isolate the logic that handles response timeouts.
 * - TTFB_TIMEOUT: The requester MUST wait a maximum of TTFB_TIMEOUT for the first response byte to arrive
 * - RESP_TIMEOUT: Requester allows a further RESP_TIMEOUT for each subsequent response_chunk
 */
function responseTimeoutsHandler(responseDecoder, options) {
    return async function* responseTimeoutsHandlerTransform(source) {
        const { TTFB_TIMEOUT, RESP_TIMEOUT } = { ...constants_1.timeoutOptions, ...options };
        const ttfbTimeoutController = new abort_controller_1.AbortController();
        const respTimeoutController = new abort_controller_1.AbortController();
        const timeoutTTFB = setTimeout(() => ttfbTimeoutController.abort(), TTFB_TIMEOUT);
        let timeoutRESP = null;
        let isFirstByte = true;
        const restartRespTimeout = () => {
            if (timeoutRESP)
                clearTimeout(timeoutRESP);
            timeoutRESP = setTimeout(() => respTimeoutController.abort(), RESP_TIMEOUT);
        };
        try {
            yield* (0, it_pipe_1.default)((0, abortableSource_1.abortableSource)(source, [
                {
                    signal: ttfbTimeoutController.signal,
                    getError: () => new errors_1.RequestInternalError({ code: errors_1.RequestErrorCode.TTFB_TIMEOUT }),
                },
                {
                    signal: respTimeoutController.signal,
                    getError: () => new errors_1.RequestInternalError({ code: errors_1.RequestErrorCode.RESP_TIMEOUT }),
                },
            ]), (0, utils_1.onChunk)((bytesChunk) => {
                // Ignore null and empty chunks
                if (isFirstByte && bytesChunk.length > 0) {
                    isFirstByte = false;
                    // On first byte, cancel the single use TTFB_TIMEOUT, and start RESP_TIMEOUT
                    clearTimeout(timeoutTTFB);
                    restartRespTimeout();
                }
            }), 
            // Transforms `Buffer` chunks to yield `ResponseBody` chunks
            responseDecoder, (0, utils_1.onChunk)(() => {
                // On <response_chunk>, cancel this chunk's RESP_TIMEOUT and start next's
                restartRespTimeout();
            }));
        }
        finally {
            clearTimeout(timeoutTTFB);
            if (timeoutRESP !== null)
                clearTimeout(timeoutRESP);
        }
    };
}
exports.responseTimeoutsHandler = responseTimeoutsHandler;
//# sourceMappingURL=responseTimeoutsHandler.js.map