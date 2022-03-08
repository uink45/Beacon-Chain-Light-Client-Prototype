"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBeaconApi = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const blocks_1 = require("./blocks");
const pool_1 = require("./pool");
const state_1 = require("./state");
function getBeaconApi(modules) {
    const block = (0, blocks_1.getBeaconBlockApi)(modules);
    const pool = (0, pool_1.getBeaconPoolApi)(modules);
    const state = (0, state_1.getBeaconStateApi)(modules);
    const { chain, config } = modules;
    return {
        ...block,
        ...pool,
        ...state,
        async getGenesis() {
            const genesisForkVersion = config.getForkVersion(lodestar_params_1.GENESIS_SLOT);
            return {
                data: {
                    genesisForkVersion,
                    genesisTime: BigInt(chain.genesisTime),
                    genesisValidatorsRoot: chain.genesisValidatorsRoot,
                },
            };
        },
    };
}
exports.getBeaconApi = getBeaconApi;
//# sourceMappingURL=index.js.map