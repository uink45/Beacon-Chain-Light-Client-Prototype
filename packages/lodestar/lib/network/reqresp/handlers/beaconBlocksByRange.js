"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectRecentBlocks = exports.onBeaconBlocksByRange = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const ssz_1 = require("@chainsafe/ssz");
const constants_1 = require("../../../constants");
const response_1 = require("../response");
// TODO: Unit test
async function* onBeaconBlocksByRange(requestBody, chain, db) {
    const { startSlot, step } = requestBody;
    let { count } = requestBody;
    if (step < 1) {
        throw new response_1.ResponseError(constants_1.RespStatus.INVALID_REQUEST, "step < 1");
    }
    if (count < 1) {
        throw new response_1.ResponseError(constants_1.RespStatus.INVALID_REQUEST, "count < 1");
    }
    // TODO: validate against MIN_EPOCHS_FOR_BLOCK_REQUESTS
    if (startSlot < lodestar_params_1.GENESIS_SLOT) {
        throw new response_1.ResponseError(constants_1.RespStatus.INVALID_REQUEST, "startSlot < genesis");
    }
    if (count > lodestar_params_1.MAX_REQUEST_BLOCKS) {
        count = lodestar_params_1.MAX_REQUEST_BLOCKS;
    }
    const lt = startSlot + count * step;
    let archivedBlocksStream;
    if (step > 1) {
        const slots = [];
        for (let slot = startSlot; slot < lt; slot += step) {
            slots.push(slot);
        }
        archivedBlocksStream = getFinalizedBlocksAtSlots(slots, db);
    }
    else {
        // step < 1 was validated above
        archivedBlocksStream = getFinalizedBlocksByRange(startSlot, lt, db);
    }
    yield* injectRecentBlocks(archivedBlocksStream, chain, db, requestBody);
}
exports.onBeaconBlocksByRange = onBeaconBlocksByRange;
async function* injectRecentBlocks(archiveStream, chain, db, request) {
    let totalBlock = 0;
    let slot = -1;
    for await (const p2pBlock of archiveStream) {
        totalBlock++;
        yield p2pBlock;
        slot = p2pBlock.slot;
    }
    slot = slot === -1 ? request.startSlot : slot + request.step;
    const upperSlot = request.startSlot + request.count * request.step;
    const slots = [];
    while (slot < upperSlot) {
        slots.push(slot);
        slot += request.step;
    }
    const p2pBlocks = await getUnfinalizedBlocksAtSlots(slots, { chain, db });
    for (const p2pBlock of p2pBlocks) {
        if (p2pBlock !== undefined) {
            totalBlock++;
            yield p2pBlock;
        }
    }
    if (totalBlock === 0) {
        throw new response_1.ResponseError(constants_1.RespStatus.RESOURCE_UNAVAILABLE, "No block found");
    }
}
exports.injectRecentBlocks = injectRecentBlocks;
async function* getFinalizedBlocksAtSlots(slots, db) {
    for (const slot of slots) {
        const bytes = await db.blockArchive.getBinary(slot);
        if (bytes !== null)
            yield { slot, bytes };
    }
}
async function* getFinalizedBlocksByRange(gte, lt, db) {
    const binaryEntriesStream = db.blockArchive.binaryEntriesStream({
        gte,
        lt,
    });
    for await (const { key, value } of binaryEntriesStream) {
        const slot = db.blockArchive.decodeKey(key);
        yield { bytes: value, slot };
    }
}
/** Returned blocks have the same ordering as `slots` */
async function getUnfinalizedBlocksAtSlots(slots, { chain, db }) {
    if (slots.length === 0) {
        return [];
    }
    const slotsSet = new Set(slots);
    const minSlot = Math.min(...slots); // Slots must have length > 0
    const blockRootsPerSlot = new Map();
    // these blocks are on the same chain to head
    for (const block of chain.forkChoice.iterateAncestorBlocks(chain.forkChoice.getHeadRoot())) {
        if (block.slot < minSlot) {
            break;
        }
        else if (slotsSet.has(block.slot)) {
            blockRootsPerSlot.set(block.slot, db.block.getBinary((0, ssz_1.fromHexString)(block.blockRoot)));
        }
    }
    const unfinalizedBlocks = await Promise.all(slots.map((slot) => blockRootsPerSlot.get(slot)));
    return unfinalizedBlocks
        .map((block, i) => ({ bytes: block, slot: slots[i] }))
        .filter((p2pBlock) => p2pBlock.bytes != null);
}
//# sourceMappingURL=beaconBlocksByRange.js.map