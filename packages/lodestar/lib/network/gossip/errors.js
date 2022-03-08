"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GossipValidationError = void 0;
class GossipValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
exports.GossipValidationError = GossipValidationError;
//# sourceMappingURL=errors.js.map