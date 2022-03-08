"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoutes = void 0;
const utils_1 = require("./utils");
const validator_1 = require("../routes/validator");
function getRoutes(config, api) {
    // All routes return JSON, use a server auto-generator
    return (0, utils_1.getGenericJsonServer)({ routesData: validator_1.routesData, getReturnTypes: validator_1.getReturnTypes, getReqSerializers: validator_1.getReqSerializers }, config, api);
}
exports.getRoutes = getRoutes;
//# sourceMappingURL=validator.js.map