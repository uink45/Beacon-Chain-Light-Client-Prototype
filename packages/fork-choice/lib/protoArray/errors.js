"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtoArrayError = exports.ProtoArrayErrorCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
var ProtoArrayErrorCode;
(function (ProtoArrayErrorCode) {
    ProtoArrayErrorCode["FINALIZED_NODE_UNKNOWN"] = "PROTO_ARRAY_ERROR_FINALIZED_NODE_UNKNOWN";
    ProtoArrayErrorCode["JUSTIFIED_NODE_UNKNOWN"] = "PROTO_ARRAY_ERROR_JUSTIFIED_NODE_UNKNOWN";
    ProtoArrayErrorCode["INVALID_FINALIZED_ROOT_CHANGE"] = "PROTO_ARRAY_ERROR_INVALID_FINALIZED_ROOT_CHANGE";
    ProtoArrayErrorCode["INVALID_NODE_INDEX"] = "PROTO_ARRAY_ERROR_INVALID_NODE_INDEX";
    ProtoArrayErrorCode["INVALID_PARENT_INDEX"] = "PROTO_ARRAY_ERROR_INVALID_PARENT_INDEX";
    ProtoArrayErrorCode["INVALID_BEST_CHILD_INDEX"] = "PROTO_ARRAY_ERROR_INVALID_BEST_CHILD_INDEX";
    ProtoArrayErrorCode["INVALID_JUSTIFIED_INDEX"] = "PROTO_ARRAY_ERROR_INVALID_JUSTIFIED_INDEX";
    ProtoArrayErrorCode["INVALID_BEST_DESCENDANT_INDEX"] = "PROTO_ARRAY_ERROR_INVALID_BEST_DESCENDANT_INDEX";
    ProtoArrayErrorCode["INVALID_PARENT_DELTA"] = "PROTO_ARRAY_ERROR_INVALID_PARENT_DELTA";
    ProtoArrayErrorCode["INVALID_NODE_DELTA"] = "PROTO_ARRAY_ERROR_INVALID_NODE_DELTA";
    ProtoArrayErrorCode["INDEX_OVERFLOW"] = "PROTO_ARRAY_ERROR_INDEX_OVERFLOW";
    ProtoArrayErrorCode["INVALID_DELTA_LEN"] = "PROTO_ARRAY_ERROR_INVALID_DELTA_LEN";
    ProtoArrayErrorCode["REVERTED_FINALIZED_EPOCH"] = "PROTO_ARRAY_ERROR_REVERTED_FINALIZED_EPOCH";
    ProtoArrayErrorCode["INVALID_BEST_NODE"] = "PROTO_ARRAY_ERROR_INVALID_BEST_NODE";
})(ProtoArrayErrorCode = exports.ProtoArrayErrorCode || (exports.ProtoArrayErrorCode = {}));
class ProtoArrayError extends lodestar_utils_1.LodestarError {
    constructor(type) {
        super(type);
    }
}
exports.ProtoArrayError = ProtoArrayError;
//# sourceMappingURL=errors.js.map