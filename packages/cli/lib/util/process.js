"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onGracefulShutdown = void 0;
const exitSignals = ["SIGTERM", "SIGINT"];
/**
 * All CLI handlers should register this callback to exit properly and not leave
 * a process hanging forever. Pass a clean function that will be run until the
 * user forcibly kills the process by doing CTRL+C again
 * @param cleanUpFunction
 */
function onGracefulShutdown(cleanUpFunction, 
// eslint-disable-next-line no-console
logFn = console.log) {
    for (const signal of exitSignals) {
        process.once(signal, async function onSignal() {
            logFn("Stopping gracefully, use Ctrl+C again to force process exit");
            process.on(signal, function onSecondSignal() {
                logFn("Forcing process exit");
                process.exit(1);
            });
            await cleanUpFunction();
        });
    }
}
exports.onGracefulShutdown = onGracefulShutdown;
//# sourceMappingURL=process.js.map