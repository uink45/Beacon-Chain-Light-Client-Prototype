"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLockFile = void 0;
let lockFile = null;
/**
 * When lockfile it's required it registers listeners to process
 * Since it's only used by the validator client, require lazily to not pollute
 * beacon_node client context
 */
function getLockFile() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    if (!lockFile)
        lockFile = require("lockfile");
    return lockFile;
}
exports.getLockFile = getLockFile;
//# sourceMappingURL=lockfile.js.map