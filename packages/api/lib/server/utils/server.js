"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenericJsonServer = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const types_1 = require("../../utils/types");
const schema_1 = require("../../utils/schema");
function getGenericJsonServer({ routesData, getReqSerializers, getReturnTypes }, config, api) {
    const reqSerializers = getReqSerializers(config);
    const returnTypes = getReturnTypes(config);
    return (0, lodestar_utils_1.mapValues)(routesData, (routeDef, routeKey) => {
        const routeSerdes = reqSerializers[routeKey];
        const returnType = returnTypes[routeKey];
        return {
            url: routeDef.url,
            method: routeDef.method,
            id: routeKey,
            schema: routeSerdes.schema && (0, schema_1.getFastifySchema)(routeSerdes.schema),
            handler: async function handler(req) {
                const args = routeSerdes.parseReq(req);
                const data = (await api[routeKey](...args));
                if (returnType) {
                    return returnType.toJson(data, types_1.jsonOpts);
                }
                else {
                    return {};
                }
            },
        };
    });
}
exports.getGenericJsonServer = getGenericJsonServer;
//# sourceMappingURL=server.js.map