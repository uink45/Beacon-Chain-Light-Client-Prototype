"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoutes = void 0;
const utils_1 = require("./utils");
const config_1 = require("../routes/config");
function getRoutes(config, api) {
    // All routes return JSON, use a server auto-generator
    return (0, utils_1.getGenericJsonServer)({ routesData: config_1.routesData, getReturnTypes: config_1.getReturnTypes, getReqSerializers: config_1.getReqSerializers }, config, api);
}
exports.getRoutes = getRoutes;
//# sourceMappingURL=config.js.map