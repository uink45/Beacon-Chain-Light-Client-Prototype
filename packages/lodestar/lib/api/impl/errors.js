"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeIsSyncing = exports.ValidationError = exports.DataNotAvailable = exports.StateNotFound = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.ApiError = ApiError;
class StateNotFound extends ApiError {
    constructor() {
        super(404, "State not found");
    }
}
exports.StateNotFound = StateNotFound;
class DataNotAvailable extends ApiError {
    constructor() {
        super(404, "Requested data cannot be served");
    }
}
exports.DataNotAvailable = DataNotAvailable;
class ValidationError extends ApiError {
    constructor(message, dataPath) {
        super(400, message);
        this.dataPath = dataPath;
    }
}
exports.ValidationError = ValidationError;
// Spec requires 503 - https://github.com/ethereum/eth2.0-APIs/blob/e68a954e1b6f6eb5421abf4532c171ce301c6b2e/types/http.yaml#L62
class NodeIsSyncing extends ApiError {
    constructor(statusMsg) {
        super(503, `Node is syncing - ${statusMsg}`);
    }
}
exports.NodeIsSyncing = NodeIsSyncing;
//# sourceMappingURL=errors.js.map