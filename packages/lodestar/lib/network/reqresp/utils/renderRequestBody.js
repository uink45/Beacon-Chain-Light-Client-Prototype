"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRequestBody = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const types_1 = require("../types");
/**
 * Render requestBody as a succint string for debug purposes
 */
function renderRequestBody(method, requestBody) {
    switch (method) {
        case types_1.Method.Status:
            // Don't log any data
            return "";
        case types_1.Method.Goodbye:
            return requestBody.toString(10);
        case types_1.Method.Ping:
            return requestBody.toString(10);
        case types_1.Method.Metadata:
            return "null";
        case types_1.Method.BeaconBlocksByRange: {
            const range = requestBody;
            return `${range.startSlot},${range.step},${range.count}`;
        }
        case types_1.Method.BeaconBlocksByRoot:
            return requestBody
                .map((root) => (0, lodestar_utils_1.toHexString)(root))
                .join(",");
    }
}
exports.renderRequestBody = renderRequestBody;
//# sourceMappingURL=renderRequestBody.js.map