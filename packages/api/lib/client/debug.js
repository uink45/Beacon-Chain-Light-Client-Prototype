"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = void 0;
const utils_1 = require("./utils");
const debug_1 = require("../routes/debug");
/**
 * REST HTTP client for debug routes
 */
function getClient(_config, httpClient) {
    const reqSerializers = (0, debug_1.getReqSerializers)();
    const returnTypes = (0, debug_1.getReturnTypes)();
    // Some routes return JSON, use a client auto-generator
    const client = (0, utils_1.generateGenericJsonClient)(debug_1.routesData, reqSerializers, returnTypes, httpClient);
    // For `getState()` generate request serializer
    const fetchOptsSerializers = (0, utils_1.getFetchOptsSerializers)(debug_1.routesData, reqSerializers);
    return {
        ...client,
        async getState(stateId, format) {
            if (format === "ssz") {
                const buffer = await httpClient.arrayBuffer(fetchOptsSerializers.getState(stateId, format));
                // Casting to any otherwise Typescript doesn't like the multi-type return
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
                return new Uint8Array(buffer);
            }
            else {
                return client.getState(stateId, format);
            }
        },
        async getStateV2(stateId, format) {
            if (format === "ssz") {
                const buffer = await httpClient.arrayBuffer(fetchOptsSerializers.getStateV2(stateId, format));
                // Casting to any otherwise Typescript doesn't like the multi-type return
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
                return new Uint8Array(buffer);
            }
            else {
                return client.getStateV2(stateId, format);
            }
        },
    };
}
exports.getClient = getClient;
//# sourceMappingURL=debug.js.map