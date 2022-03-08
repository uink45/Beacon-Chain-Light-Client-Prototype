"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueError = exports.QueueErrorCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
var QueueErrorCode;
(function (QueueErrorCode) {
    QueueErrorCode["QUEUE_ABORTED"] = "QUEUE_ERROR_QUEUE_ABORTED";
    QueueErrorCode["QUEUE_MAX_LENGTH"] = "QUEUE_ERROR_QUEUE_MAX_LENGTH";
})(QueueErrorCode = exports.QueueErrorCode || (exports.QueueErrorCode = {}));
class QueueError extends lodestar_utils_1.LodestarError {
    constructor(type) {
        super(type);
    }
}
exports.QueueError = QueueError;
//# sourceMappingURL=errors.js.map