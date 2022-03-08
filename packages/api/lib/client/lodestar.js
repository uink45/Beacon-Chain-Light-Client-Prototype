"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = void 0;
const utils_1 = require("./utils");
const lodestar_1 = require("../routes/lodestar");
/**
 * REST HTTP client for lodestar routes
 */
function getClient(_config, httpClient) {
    const reqSerializers = (0, lodestar_1.getReqSerializers)();
    const returnTypes = (0, lodestar_1.getReturnTypes)();
    // All routes return JSON, use a client auto-generator
    return (0, utils_1.generateGenericJsonClient)(lodestar_1.routesData, reqSerializers, returnTypes, httpClient);
}
exports.getClient = getClient;
//# sourceMappingURL=lodestar.js.map