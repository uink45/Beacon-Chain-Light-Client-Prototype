"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = void 0;
const utils_1 = require("./utils");
const node_1 = require("../routes/node");
/**
 * REST HTTP client for beacon routes
 */
function getClient(_config, httpClient) {
    const reqSerializers = (0, node_1.getReqSerializers)();
    const returnTypes = (0, node_1.getReturnTypes)();
    // All routes return JSON, use a client auto-generator
    return (0, utils_1.generateGenericJsonClient)(node_1.routesData, reqSerializers, returnTypes, httpClient);
}
exports.getClient = getClient;
//# sourceMappingURL=node.js.map