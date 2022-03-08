"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForGenesis = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
/** The time between polls when waiting for genesis */
const WAITING_FOR_GENESIS_POLL_MS = 12 * 1000;
async function waitForGenesis(api, logger, signal) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const res = await api.beacon.getGenesis();
            return res.data;
        }
        catch (e) {
            // TODO: Search for a 404 error which indicates that genesis has not yet occurred.
            // Note: Lodestar API does not become online after genesis is found
            logger.info("Waiting for genesis", { message: e.message });
            await (0, lodestar_utils_1.sleep)(WAITING_FOR_GENESIS_POLL_MS, signal);
        }
    }
}
exports.waitForGenesis = waitForGenesis;
//# sourceMappingURL=genesis.js.map