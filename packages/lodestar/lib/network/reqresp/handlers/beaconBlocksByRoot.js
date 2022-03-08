"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onBeaconBlocksByRoot = void 0;
const multifork_1 = require("../../../util/multifork");
async function* onBeaconBlocksByRoot(requestBody, chain, db) {
    for (const blockRoot of requestBody) {
        const root = blockRoot.valueOf();
        const summary = chain.forkChoice.getBlock(root);
        let blockBytes = null;
        // finalized block has summary in forkchoice but it stays in blockArchive db
        if (summary) {
            blockBytes = await db.block.getBinary(root);
        }
        let slot = undefined;
        if (!blockBytes) {
            const blockEntry = await db.blockArchive.getBinaryEntryByRoot(root);
            if (blockEntry) {
                slot = blockEntry.key;
                blockBytes = blockEntry.value;
            }
        }
        if (blockBytes) {
            yield {
                bytes: blockBytes,
                slot: slot !== null && slot !== void 0 ? slot : (0, multifork_1.getSlotFromBytes)(blockBytes),
            };
        }
    }
}
exports.onBeaconBlocksByRoot = onBeaconBlocksByRoot;
//# sourceMappingURL=beaconBlocksByRoot.js.map