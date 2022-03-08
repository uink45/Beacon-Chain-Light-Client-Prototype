"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBeaconBlockApi = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const ssz_1 = require("@chainsafe/ssz");
const errors_1 = require("../../../../chain/errors");
const validatorMonitor_1 = require("../../../../metrics/validatorMonitor");
const network_1 = require("../../../../network");
const utils_1 = require("./utils");
/**
 * Validator clock may be advanced from beacon's clock. If the validator requests a resource in a
 * future slot, wait some time instead of rejecting the request because it's in the future
 */
const MAX_API_CLOCK_DISPARITY_MS = 1000;
function getBeaconBlockApi({ chain, config, metrics, network, db, }) {
    return {
        async getBlockHeaders(filters) {
            // TODO - SLOW CODE: This code seems like it could be improved
            const result = [];
            if (filters.parentRoot) {
                const parentRoot = filters.parentRoot;
                const finalizedBlock = await db.blockArchive.getByParentRoot((0, ssz_1.fromHexString)(parentRoot));
                if (finalizedBlock) {
                    result.push((0, utils_1.toBeaconHeaderResponse)(config, finalizedBlock, true));
                }
                const nonFinalizedBlocks = chain.forkChoice.getBlockSummariesByParentRoot(parentRoot);
                await Promise.all(nonFinalizedBlocks.map(async (summary) => {
                    const block = await db.block.get((0, ssz_1.fromHexString)(summary.blockRoot));
                    if (block) {
                        const cannonical = chain.forkChoice.getCanonicalBlockAtSlot(block.message.slot);
                        if (cannonical) {
                            result.push((0, utils_1.toBeaconHeaderResponse)(config, block, cannonical.blockRoot === summary.blockRoot));
                        }
                    }
                }));
                return {
                    data: result.filter((item) => 
                    // skip if no slot filter
                    !(filters.slot !== undefined && filters.slot !== 0) || item.header.message.slot === filters.slot),
                };
            }
            const headSlot = chain.forkChoice.getHead().slot;
            if (!filters.parentRoot && filters.slot === undefined) {
                filters.slot = headSlot;
            }
            if (filters.slot !== undefined) {
                // future slot
                if (filters.slot > headSlot) {
                    return { data: [] };
                }
                const canonicalBlock = await chain.getCanonicalBlockAtSlot(filters.slot);
                // skip slot
                if (!canonicalBlock) {
                    return { data: [] };
                }
                const canonicalRoot = config
                    .getForkTypes(canonicalBlock.message.slot)
                    .BeaconBlock.hashTreeRoot(canonicalBlock.message);
                result.push((0, utils_1.toBeaconHeaderResponse)(config, canonicalBlock, true));
                // fork blocks
                // TODO: What is this logic?
                await Promise.all(chain.forkChoice.getBlockSummariesAtSlot(filters.slot).map(async (summary) => {
                    if (summary.blockRoot !== (0, ssz_1.toHexString)(canonicalRoot)) {
                        const block = await db.block.get((0, ssz_1.fromHexString)(summary.blockRoot));
                        if (block) {
                            result.push((0, utils_1.toBeaconHeaderResponse)(config, block));
                        }
                    }
                }));
            }
            return { data: result };
        },
        async getBlockHeader(blockId) {
            const block = await (0, utils_1.resolveBlockId)(chain.forkChoice, db, blockId);
            return { data: (0, utils_1.toBeaconHeaderResponse)(config, block, true) };
        },
        async getBlock(blockId) {
            return { data: await (0, utils_1.resolveBlockId)(chain.forkChoice, db, blockId) };
        },
        async getBlockV2(blockId) {
            const block = await (0, utils_1.resolveBlockId)(chain.forkChoice, db, blockId);
            return { data: block, version: config.getForkName(block.message.slot) };
        },
        async getBlockAttestations(blockId) {
            const block = await (0, utils_1.resolveBlockId)(chain.forkChoice, db, blockId);
            return { data: Array.from(block.message.body.attestations) };
        },
        async getBlockRoot(blockId) {
            // Fast path: From head state already available in memory get historical blockRoot
            const slot = typeof blockId === "string" ? parseInt(blockId) : blockId;
            if (!Number.isNaN(slot)) {
                const head = chain.forkChoice.getHead();
                if (slot === head.slot) {
                    return { data: (0, ssz_1.fromHexString)(head.blockRoot) };
                }
                if (slot < head.slot && head.slot <= slot + lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT) {
                    const state = chain.getHeadState();
                    return { data: state.blockRoots[slot % lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT] };
                }
            }
            else if (blockId === "head") {
                const head = chain.forkChoice.getHead();
                return { data: (0, ssz_1.fromHexString)(head.blockRoot) };
            }
            // Slow path
            const block = await (0, utils_1.resolveBlockId)(chain.forkChoice, db, blockId);
            return { data: config.getForkTypes(block.message.slot).BeaconBlock.hashTreeRoot(block.message) };
        },
        async publishBlock(signedBlock) {
            const seenTimestampSec = Date.now() / 1000;
            // Simple implementation of a pending block queue. Keeping the block here recycles the API logic, and keeps the
            // REST request promise without any extra infrastructure.
            const msToBlockSlot = (0, lodestar_beacon_state_transition_1.computeTimeAtSlot)(config, signedBlock.message.slot, chain.genesisTime) * 1000 - Date.now();
            if (msToBlockSlot <= MAX_API_CLOCK_DISPARITY_MS && msToBlockSlot > 0) {
                // If block is a bit early, hold it in a promise. Equivalent to a pending queue.
                await (0, lodestar_utils_1.sleep)(msToBlockSlot);
            }
            // TODO: Validate block
            metrics === null || metrics === void 0 ? void 0 : metrics.registerBeaconBlock(validatorMonitor_1.OpSource.api, seenTimestampSec, signedBlock.message);
            await Promise.all([
                // Send the block, regardless of whether or not it is valid. The API
                // specification is very clear that this is the desired behaviour.
                network.gossip.publishBeaconBlock(signedBlock),
                chain.processBlock(signedBlock).catch((e) => {
                    if (e instanceof errors_1.BlockError && e.type.code === errors_1.BlockErrorCode.PARENT_UNKNOWN) {
                        network.events.emit(network_1.NetworkEvent.unknownBlockParent, signedBlock, network.peerId.toB58String());
                    }
                    throw e;
                }),
            ]);
        },
    };
}
exports.getBeaconBlockApi = getBeaconBlockApi;
//# sourceMappingURL=index.js.map