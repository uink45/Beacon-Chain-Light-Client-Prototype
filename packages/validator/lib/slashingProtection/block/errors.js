"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidBlockError = exports.InvalidBlockErrorCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
var InvalidBlockErrorCode;
(function (InvalidBlockErrorCode) {
    /**
     * The block has the same slot as a block from the DB
     */
    InvalidBlockErrorCode["DOUBLE_BLOCK_PROPOSAL"] = "ERR_INVALID_BLOCK_DOUBLE_BLOCK_PROPOSAL";
    /**
     * The block is invalid because its slot is less than the lower bound slot for this validator.
     */
    InvalidBlockErrorCode["SLOT_LESS_THAN_LOWER_BOUND"] = "ERR_INVALID_BLOCK_SLOT_LESS_THAN_LOWER_BOUND";
})(InvalidBlockErrorCode = exports.InvalidBlockErrorCode || (exports.InvalidBlockErrorCode = {}));
class InvalidBlockError extends lodestar_utils_1.LodestarError {
    constructor(type) {
        super(type);
    }
}
exports.InvalidBlockError = InvalidBlockError;
//# sourceMappingURL=errors.js.map