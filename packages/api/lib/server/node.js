"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoutes = void 0;
const utils_1 = require("./utils");
const node_1 = require("../routes/node");
function getRoutes(config, api) {
    // All routes return JSON, use a server auto-generator
    const serverRoutes = (0, utils_1.getGenericJsonServer)({ routesData: node_1.routesData, getReturnTypes: node_1.getReturnTypes, getReqSerializers: node_1.getReqSerializers }, config, api);
    return {
        ...serverRoutes,
        getHealth: {
            ...serverRoutes.getHealth,
            handler: async (req, res) => {
                const healthCode = await api.getHealth();
                res.raw.writeHead(healthCode);
                res.raw.write(String(healthCode));
                res.raw.end();
            },
        },
    };
}
exports.getRoutes = getRoutes;
//# sourceMappingURL=node.js.map