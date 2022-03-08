"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLcLoggerConsole = void 0;
/* eslint-disable no-console */
/**
 * With `console` module and ignoring debug logs
 */
function getLcLoggerConsole(opts) {
    return {
        error: console.error,
        warn: console.warn,
        info: console.log,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        debug: (opts === null || opts === void 0 ? void 0 : opts.logDebug) ? console.log : () => { },
    };
}
exports.getLcLoggerConsole = getLcLoggerConsole;
//# sourceMappingURL=logger.js.map