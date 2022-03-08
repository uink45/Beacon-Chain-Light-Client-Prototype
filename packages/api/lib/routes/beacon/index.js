"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnTypes = exports.getReqSerializers = exports.routesData = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const utils_1 = require("../../utils");
const block = __importStar(require("./block"));
const pool = __importStar(require("./pool"));
const state = __importStar(require("./state"));
exports.routesData = {
    getGenesis: { url: "/eth/v1/beacon/genesis", method: "GET" },
    ...block.routesData,
    ...pool.routesData,
    ...state.routesData,
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
function getReqSerializers(config) {
    return {
        getGenesis: utils_1.reqEmpty,
        ...block.getReqSerializers(config),
        ...pool.getReqSerializers(),
        ...state.getReqSerializers(),
    };
}
exports.getReqSerializers = getReqSerializers;
function getReturnTypes() {
    return {
        getGenesis: (0, utils_1.ContainerData)(lodestar_types_1.ssz.phase0.Genesis),
        ...block.getReturnTypes(),
        ...pool.getReturnTypes(),
        ...state.getReturnTypes(),
    };
}
exports.getReturnTypes = getReturnTypes;
//# sourceMappingURL=index.js.map