"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoutes = void 0;
const utils_1 = require("./utils");
const beacon_1 = require("../routes/beacon");
function getRoutes(config, api) {
    // All routes return JSON, use a server auto-generator
    return (0, utils_1.getGenericJsonServer)({ routesData: beacon_1.routesData, getReturnTypes: beacon_1.getReturnTypes, getReqSerializers: beacon_1.getReqSerializers }, config, api);
}
exports.getRoutes = getRoutes;
//# sourceMappingURL=beacon.js.map