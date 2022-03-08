"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoutes = void 0;
const utils_1 = require("./utils");
const lodestar_1 = require("../routes/lodestar");
function getRoutes(config, api) {
    // All routes return JSON, use a server auto-generator
    return (0, utils_1.getGenericJsonServer)({ routesData: lodestar_1.routesData, getReturnTypes: lodestar_1.getReturnTypes, getReqSerializers: lodestar_1.getReqSerializers }, config, api);
}
exports.getRoutes = getRoutes;
//# sourceMappingURL=lodestar.js.map