"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenesisValidatorsRoot = exports.getSlashingProtection = void 0;
const lodestar_api_1 = require("@chainsafe/lodestar-api");
const lodestar_validator_1 = require("@chainsafe/lodestar-validator");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const util_1 = require("../../../../../util");
const paths_1 = require("../../../../validator/paths");
const config_1 = require("../../../../../config");
const logger_1 = require("../../../../../util/logger");
/**
 * Returns a new SlashingProtection object instance based on global args.
 */
function getSlashingProtection(args) {
    const validatorPaths = (0, paths_1.getValidatorPaths)(args);
    const dbPath = validatorPaths.validatorsDbDir;
    const config = (0, config_1.getBeaconConfigFromArgs)(args);
    const logger = (0, logger_1.errorLogger)();
    return new lodestar_validator_1.SlashingProtection({
        config,
        controller: new lodestar_db_1.LevelDbController({ name: dbPath }, { logger }),
    });
}
exports.getSlashingProtection = getSlashingProtection;
/**
 * Returns genesisValidatorsRoot from validator API client.
 */
async function getGenesisValidatorsRoot(args) {
    const server = args.server;
    const config = (0, config_1.getBeaconConfigFromArgs)(args);
    const api = (0, lodestar_api_1.getClient)(config, { baseUrl: server });
    const genesis = await api.beacon.getGenesis();
    if (genesis !== undefined) {
        return genesis.data.genesisValidatorsRoot;
    }
    else {
        if (args.force) {
            return Buffer.alloc(32, 0);
        }
        else {
            throw new util_1.YargsError(`Can't get genesisValidatorsRoot from Beacon node at ${server}`);
        }
    }
}
exports.getGenesisValidatorsRoot = getGenesisValidatorsRoot;
//# sourceMappingURL=utils.js.map