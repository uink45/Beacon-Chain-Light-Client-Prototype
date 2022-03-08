"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = void 0;
const utils_1 = require("./utils");
const validator_1 = require("../routes/validator");
/**
 * REST HTTP client for validator routes
 */
function getClient(_config, httpClient) {
    const reqSerializers = (0, validator_1.getReqSerializers)();
    const returnTypes = (0, validator_1.getReturnTypes)();
    // All routes return JSON, use a client auto-generator
    return (0, utils_1.generateGenericJsonClient)(validator_1.routesData, reqSerializers, returnTypes, httpClient);
}
exports.getClient = getClient;
//# sourceMappingURL=validator.js.map