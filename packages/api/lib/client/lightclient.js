"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = void 0;
const persistent_merkle_tree_1 = require("@chainsafe/persistent-merkle-tree");
const utils_1 = require("./utils");
const lightclient_1 = require("../routes/lightclient");
/**
 * REST HTTP client for lightclient routes
 */
function getClient(_config, httpClient) {
    const reqSerializers = (0, lightclient_1.getReqSerializers)();
    const returnTypes = (0, lightclient_1.getReturnTypes)();
    // Some routes return JSON, use a client auto-generator
    const client = (0, utils_1.generateGenericJsonClient)(lightclient_1.routesData, reqSerializers, returnTypes, httpClient);
    // For `getStateProof()` generate request serializer
    const fetchOptsSerializers = (0, utils_1.getFetchOptsSerializers)(lightclient_1.routesData, reqSerializers);
    return {
        ...client,
        async getStateProof(stateId, paths) {
            const buffer = await httpClient.arrayBuffer(fetchOptsSerializers.getStateProof(stateId, paths));
            const proof = (0, persistent_merkle_tree_1.deserializeProof)(new Uint8Array(buffer));
            return { data: proof };
        },
    };
}
exports.getClient = getClient;
//# sourceMappingURL=lightclient.js.map