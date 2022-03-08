"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoutes = void 0;
const utils_1 = require("../utils");
const utils_2 = require("./utils");
const debug_1 = require("../routes/debug");
function getRoutes(config, api) {
    const reqSerializers = (0, debug_1.getReqSerializers)();
    const returnTypes = (0, debug_1.getReturnTypes)();
    const serverRoutes = (0, utils_2.getGenericJsonServer)({ routesData: debug_1.routesData, getReturnTypes: debug_1.getReturnTypes, getReqSerializers: debug_1.getReqSerializers }, config, api);
    return {
        ...serverRoutes,
        // Non-JSON routes. Return JSON or binary depending on "accept" header
        getState: {
            ...serverRoutes.getState,
            handler: async (req) => {
                const data = await api.getState(...reqSerializers.getState.parseReq(req));
                if (data instanceof Uint8Array) {
                    // Fastify 3.x.x will automatically add header `Content-Type: application/octet-stream` if Buffer
                    return Buffer.from(data);
                }
                else {
                    return returnTypes.getState.toJson(data, utils_1.jsonOpts);
                }
            },
        },
        getStateV2: {
            ...serverRoutes.getStateV2,
            handler: async (req) => {
                const data = await api.getStateV2(...reqSerializers.getStateV2.parseReq(req));
                if (data instanceof Uint8Array) {
                    // Fastify 3.x.x will automatically add header `Content-Type: application/octet-stream` if Buffer
                    return Buffer.from(data);
                }
                else {
                    return returnTypes.getStateV2.toJson(data, utils_1.jsonOpts);
                }
            },
        },
    };
}
exports.getRoutes = getRoutes;
//# sourceMappingURL=debug.js.map