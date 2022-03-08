"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchItems = void 0;
/**
 * Divide pubkeys into batches, each batch contains at most 5 http requests,
 * each request can work on at most 40 pubkeys.
 */
function batchItems(items, opts) {
    var _a;
    const batches = [];
    const maxBatches = (_a = opts.maxBatches) !== null && _a !== void 0 ? _a : Math.ceil(items.length / opts.batchSize);
    for (let i = 0; i < maxBatches; i++) {
        const batch = items.slice(opts.batchSize * i, opts.batchSize * (i + 1));
        if (batch.length === 0)
            break;
        batches.push(batch);
    }
    return batches;
}
exports.batchItems = batchItems;
//# sourceMappingURL=batch.js.map