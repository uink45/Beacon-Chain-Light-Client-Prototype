"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = void 0;
const utils_1 = require("./utils");
const beacon_1 = require("../routes/beacon");
/**
 * REST HTTP client for beacon routes
 */
function getClient(config, httpClient) {
    const reqSerializers = (0, beacon_1.getReqSerializers)(config);
    const returnTypes = (0, beacon_1.getReturnTypes)();
    // All routes return JSON, use a client auto-generator
    return (0, utils_1.generateGenericJsonClient)(beacon_1.routesData, reqSerializers, returnTypes, httpClient);
}
exports.getClient = getClient;
//# sourceMappingURL=beacon.js.map