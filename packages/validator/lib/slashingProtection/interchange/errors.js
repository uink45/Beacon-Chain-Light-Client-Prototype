"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterchangeError = exports.InterchangeErrorErrorCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
var InterchangeErrorErrorCode;
(function (InterchangeErrorErrorCode) {
    InterchangeErrorErrorCode["UNSUPPORTED_FORMAT"] = "ERR_INTERCHANGE_UNSUPPORTED_FORMAT";
    InterchangeErrorErrorCode["UNSUPPORTED_VERSION"] = "ERR_INTERCHANGE_UNSUPPORTED_VERSION";
    InterchangeErrorErrorCode["GENESIS_VALIDATOR_MISMATCH"] = "ERR_INTERCHANGE_GENESIS_VALIDATOR_MISMATCH";
})(InterchangeErrorErrorCode = exports.InterchangeErrorErrorCode || (exports.InterchangeErrorErrorCode = {}));
class InterchangeError extends lodestar_utils_1.LodestarError {
    constructor(type) {
        super(type);
    }
}
exports.InterchangeError = InterchangeError;
//# sourceMappingURL=errors.js.map