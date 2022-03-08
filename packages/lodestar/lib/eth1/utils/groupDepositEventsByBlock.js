"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupDepositEventsByBlock = void 0;
/**
 * Return deposit events of blocks grouped/sorted by block number and deposit index
 * Blocks without events are omitted
 * @param depositEvents range deposit events
 */
function groupDepositEventsByBlock(depositEvents) {
    depositEvents.sort((event1, event2) => event1.index - event2.index);
    const depositsByBlockMap = new Map();
    for (const deposit of depositEvents) {
        depositsByBlockMap.set(deposit.blockNumber, [...(depositsByBlockMap.get(deposit.blockNumber) || []), deposit]);
    }
    return Array.from(depositsByBlockMap.entries()).map(([blockNumber, depositEvents]) => ({
        blockNumber,
        depositEvents,
    }));
}
exports.groupDepositEventsByBlock = groupDepositEventsByBlock;
//# sourceMappingURL=groupDepositEventsByBlock.js.map