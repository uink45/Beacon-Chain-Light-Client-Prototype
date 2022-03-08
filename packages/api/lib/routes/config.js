"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnTypes = exports.getReqSerializers = exports.routesData = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const ssz_1 = require("@chainsafe/ssz");
const utils_1 = require("../utils");
/**
 * Define javascript values for each route
 */
exports.routesData = {
    getDepositContract: { url: "/eth/v1/config/deposit_contract", method: "GET" },
    getForkSchedule: { url: "/eth/v1/config/fork_schedule", method: "GET" },
    getSpec: { url: "/eth/v1/config/spec", method: "GET" },
};
function getReqSerializers() {
    return (0, lodestar_utils_1.mapValues)(exports.routesData, () => utils_1.reqEmpty);
}
exports.getReqSerializers = getReqSerializers;
/* eslint-disable @typescript-eslint/naming-convention */
function getReturnTypes() {
    const DepositContract = new ssz_1.ContainerType({
        fields: {
            chainId: lodestar_types_1.ssz.Number64,
            address: new ssz_1.ByteVectorType({ length: 20 }),
        },
        // From beacon apis
        casingMap: {
            chainId: "chain_id",
            address: "address",
        },
    });
    return {
        getDepositContract: (0, utils_1.ContainerData)(DepositContract),
        getForkSchedule: (0, utils_1.ContainerData)((0, utils_1.ArrayOf)(lodestar_types_1.ssz.phase0.Fork)),
        getSpec: (0, utils_1.ContainerData)((0, utils_1.sameType)()),
    };
}
exports.getReturnTypes = getReturnTypes;
//# sourceMappingURL=config.js.map