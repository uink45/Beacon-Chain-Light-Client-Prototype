"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupByFork = void 0;
/**
 * Group an array of items by ForkName according to the slot associted to each item
 */
function groupByFork(config, items, getSlot) {
    const itemsByFork = new Map();
    for (const item of items) {
        const forkName = config.getForkName(getSlot(item));
        let itemsInFork = itemsByFork.get(forkName);
        if (!itemsInFork) {
            itemsInFork = [];
            itemsByFork.set(forkName, itemsInFork);
        }
        itemsInFork.push(item);
    }
    return itemsByFork;
}
exports.groupByFork = groupByFork;
//# sourceMappingURL=forkName.js.map