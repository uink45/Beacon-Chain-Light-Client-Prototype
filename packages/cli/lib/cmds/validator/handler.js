"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorHandler = void 0;
const abort_controller_1 = require("@chainsafe/abort-controller");
const lodestar_api_1 = require("@chainsafe/lodestar-api");
const lodestar_validator_1 = require("@chainsafe/lodestar-validator");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const config_1 = require("../../config");
const util_1 = require("../../util");
const util_2 = require("../../util");
const paths_1 = require("../beacon/paths");
const paths_2 = require("./paths");
const keys_1 = require("./keys");
const version_1 = require("../../util/version");
/**
 * Runs a validator client.
 */
async function validatorHandler(args) {
    await (0, util_1.initBLS)();
    const graffiti = args.graffiti || (0, util_1.getDefaultGraffiti)();
    const validatorPaths = (0, paths_2.getValidatorPaths)(args);
    const beaconPaths = (0, paths_1.getBeaconPaths)(args);
    const config = (0, config_1.getBeaconConfigFromArgs)(args);
    const logger = (0, util_1.getCliLogger)(args, beaconPaths, config);
    const version = (0, version_1.getVersion)();
    logger.info("Lodestar", { version: version, network: args.network });
    const dbPath = validatorPaths.validatorsDbDir;
    (0, util_1.mkdir)(dbPath);
    const onGracefulShutdownCbs = [];
    (0, util_2.onGracefulShutdown)(async () => {
        for (const cb of onGracefulShutdownCbs)
            await cb();
    }, logger.info.bind(logger));
    const signers = [];
    // Read remote keys
    const externalSigners = await (0, keys_1.getExternalSigners)(args);
    if (externalSigners.length > 0) {
        logger.info(`Using ${externalSigners.length} external keys`);
        for (const { externalSignerUrl, pubkeyHex } of externalSigners) {
            signers.push({
                type: lodestar_validator_1.SignerType.Remote,
                pubkeyHex: pubkeyHex,
                externalSignerUrl,
            });
        }
        // Log pubkeys for auditing, grouped by signer URL
        for (const { externalSignerUrl, pubkeysHex } of (0, keys_1.groupExternalSignersByUrl)(externalSigners)) {
            logger.info(`External signer URL: ${externalSignerUrl}`);
            for (const pubkeyHex of pubkeysHex) {
                logger.info(pubkeyHex);
            }
        }
    }
    // Read local keys
    else {
        const { secretKeys, unlockSecretKeys } = await (0, keys_1.getLocalSecretKeys)(args);
        if (secretKeys.length > 0) {
            // Log pubkeys for auditing
            logger.info(`Decrypted ${secretKeys.length} local keystores`);
            for (const secretKey of secretKeys) {
                logger.info(secretKey.toPublicKey().toHex());
                signers.push({
                    type: lodestar_validator_1.SignerType.Local,
                    secretKey,
                });
            }
            onGracefulShutdownCbs.push(() => unlockSecretKeys === null || unlockSecretKeys === void 0 ? void 0 : unlockSecretKeys());
        }
    }
    // Ensure the validator has at least one key
    if (signers.length === 0) {
        throw new util_1.YargsError("No signers found with current args");
    }
    // This AbortController interrupts the sleep() calls when waiting for genesis
    const controller = new abort_controller_1.AbortController();
    onGracefulShutdownCbs.push(async () => controller.abort());
    const api = (0, lodestar_api_1.getClient)(config, { baseUrl: args.server });
    const dbOps = {
        config: config,
        controller: new lodestar_db_1.LevelDbController({ name: dbPath }, { logger }),
    };
    const slashingProtection = new lodestar_validator_1.SlashingProtection(dbOps);
    const validator = await lodestar_validator_1.Validator.initializeFromBeaconNode({ dbOps, slashingProtection, api, logger, signers, graffiti }, controller.signal);
    onGracefulShutdownCbs.push(async () => await validator.stop());
    await validator.start();
}
exports.validatorHandler = validatorHandler;
//# sourceMappingURL=handler.js.map