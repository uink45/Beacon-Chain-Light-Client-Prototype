"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = void 0;
const utils_1 = require("./utils");
const config_1 = require("../routes/config");
/**
 * REST HTTP client for config routes
 */
function getClient(config, httpClient) {
    const reqSerializers = (0, config_1.getReqSerializers)();
    const returnTypes = (0, config_1.getReturnTypes)();
    // All routes return JSON, use a client auto-generator
    return (0, utils_1.generateGenericJsonClient)(config_1.routesData, reqSerializers, returnTypes, httpClient);
}
exports.getClient = getClient;
//# sourceMappingURL=config.js.map