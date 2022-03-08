"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoggerVc = void 0;
const lodestar_api_1 = require("@chainsafe/lodestar-api");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
function getLoggerVc(logger, clock) {
    let hasLogged = false;
    clock.runEverySlot(async () => {
        if (hasLogged)
            hasLogged = false;
    });
    return {
        error(message, context, e) {
            if (e) {
                // Returns true if it's an network error with code 503 = Node is syncing
                // https://github.com/ethereum/eth2.0-APIs/blob/e68a954e1b6f6eb5421abf4532c171ce301c6b2e/types/http.yaml#L62
                if (e instanceof lodestar_api_1.HttpError && e.status === 503) {
                    this.isSyncing(e);
                }
                // Only log if arg `e` is not an instance of `ErrorAborted`
                else if (!(0, lodestar_utils_1.isErrorAborted)(e)) {
                    logger.error(message, context, e);
                }
            }
            else {
                logger.error(message, context, e);
            }
        },
        // error: logger.error.bind(logger),
        warn: logger.warn.bind(logger),
        info: logger.info.bind(logger),
        verbose: logger.verbose.bind(logger),
        debug: logger.debug.bind(logger),
        /**
         * Throttle "node is syncing" errors to not pollute the console too much.
         * Logs once per slot at most.
         */
        isSyncing(e) {
            if (!hasLogged) {
                hasLogged = true;
                // Log the full error message, in case the server returns 503 for some unknown reason
                logger.info(`Node is syncing - ${e.message}`);
            }
        },
    };
}
exports.getLoggerVc = getLoggerVc;
//# sourceMappingURL=logger.js.map