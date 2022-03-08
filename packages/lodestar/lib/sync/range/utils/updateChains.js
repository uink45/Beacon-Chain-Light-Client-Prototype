"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChains = void 0;
const sortBy_1 = require("../../../util/sortBy");
const constants_1 = require("../../constants");
const remoteSyncType_1 = require("../../utils/remoteSyncType");
/**
 * Priotize existing chains based on their target and peer count
 * Returns an array of chains toStart and toStop to comply with the priotization
 */
function updateChains(chains) {
    const finalizedChains = [];
    const headChains = [];
    for (const chain of chains) {
        if (chain.syncType === remoteSyncType_1.RangeSyncType.Finalized) {
            finalizedChains.push(chain);
        }
        else {
            headChains.push(chain);
        }
    }
    const toStart = [];
    const toStop = [];
    if (finalizedChains.length > 0) {
        // Pick first only
        const [newSyncChain] = prioritizeSyncChains(finalizedChains);
        // TODO: Should it stop all HEAD chains if going from a head sync to a finalized sync?
        const currentSyncChain = finalizedChains.find((syncChain) => syncChain.isSyncing);
        // Only switch from currentSyncChain to newSyncChain if necessary
        // Avoid unnecesary switchings and try to advance it
        if (!currentSyncChain ||
            (newSyncChain !== currentSyncChain &&
                newSyncChain.peers > currentSyncChain.peers &&
                currentSyncChain.validatedEpochs > constants_1.MIN_FINALIZED_CHAIN_VALIDATED_EPOCHS)) {
            toStart.push(newSyncChain);
            if (currentSyncChain)
                toStop.push(currentSyncChain);
        }
    }
    else {
        for (const syncChain of prioritizeSyncChains(headChains)) {
            if (toStart.length < constants_1.PARALLEL_HEAD_CHAINS) {
                toStart.push(syncChain);
            }
            else {
                toStop.push(syncChain);
            }
        }
    }
    return { toStart, toStop };
}
exports.updateChains = updateChains;
/**
 * Order `syncChains` by most peers and already syncing first
 * If two chains have the same number of peers, prefer the already syncing to not drop progress
 */
function prioritizeSyncChains(syncChains) {
    return (0, sortBy_1.sortBy)(syncChains, (syncChain) => -syncChain.peers, // Sort from high peer count to low: negative to reverse
    (syncChain) => (syncChain.isSyncing ? 0 : 1) // Sort by isSyncing first = 0
    );
}
//# sourceMappingURL=updateChains.js.map