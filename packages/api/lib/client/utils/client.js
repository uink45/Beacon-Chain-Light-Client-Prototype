"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGenericJsonClient = exports.getFetchOptsSerializers = exports.getFetchOptsSerializer = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const urlFormat_1 = require("../../utils/urlFormat");
const types_1 = require("../../utils/types");
// See /packages/api/src/routes/index.ts for reasoning
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Format FetchFn opts from Fn arguments given a route definition and request serializer.
 * For routes that return only JSOn use @see getGenericJsonClient
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
function getFetchOptsSerializer(routeDef, reqSerializer) {
    const urlFormater = (0, urlFormat_1.compileRouteUrlFormater)(routeDef.url);
    return function getFetchOpts(...args) {
        const req = reqSerializer.writeReq(...args);
        return {
            url: urlFormater(req.params || {}),
            method: routeDef.method,
            query: req.query,
            body: req.body,
            headers: req.headers,
        };
    };
}
exports.getFetchOptsSerializer = getFetchOptsSerializer;
/**
 * Generate `getFetchOptsSerializer()` functions for all routes in `Api`
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
function getFetchOptsSerializers(routesData, reqSerializers) {
    return (0, lodestar_utils_1.mapValues)(routesData, (routeDef, routeKey) => getFetchOptsSerializer(routeDef, reqSerializers[routeKey]));
}
exports.getFetchOptsSerializers = getFetchOptsSerializers;
/**
 * Get a generic JSON client from route definition, request serializer and return types.
 */
function generateGenericJsonClient(routesData, reqSerializers, returnTypes, fetchFn) {
    return (0, lodestar_utils_1.mapValues)(routesData, (routeDef, routeKey) => {
        const fetchOptsSerializer = getFetchOptsSerializer(routeDef, reqSerializers[routeKey]);
        const returnType = returnTypes[routeKey];
        return async function request(...args) {
            const res = await fetchFn.json(fetchOptsSerializer(...args));
            if (returnType) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return returnType.fromJson(res, types_1.jsonOpts);
            }
        };
    });
}
exports.generateGenericJsonClient = generateGenericJsonClient;
//# sourceMappingURL=client.js.map