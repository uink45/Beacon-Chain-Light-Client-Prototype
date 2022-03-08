"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseError = exports.ResponseErrorCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const constants_1 = require("../../../constants");
var ResponseErrorCode;
(function (ResponseErrorCode) {
    ResponseErrorCode["RESPONSE_STATUS_ERROR"] = "RESPONSE_STATUS_ERROR";
})(ResponseErrorCode = exports.ResponseErrorCode || (exports.ResponseErrorCode = {}));
/**
 * Used internally only to signal a response status error. Since the error should never bubble up to the user,
 * the error code and error message does not matter much.
 */
class ResponseError extends lodestar_utils_1.LodestarError {
    constructor(status, errorMessage) {
        const type = { code: ResponseErrorCode.RESPONSE_STATUS_ERROR, status, errorMessage };
        super(type, `RESPONSE_ERROR_${constants_1.RespStatus[status]}: ${errorMessage}`);
        this.status = status;
        this.errorMessage = errorMessage;
    }
}
exports.ResponseError = ResponseError;
//# sourceMappingURL=errors.js.map