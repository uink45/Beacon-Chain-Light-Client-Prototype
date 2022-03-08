"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockProposingService = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const ssz_1 = require("@chainsafe/ssz");
const util_1 = require("../util");
const blockDuties_1 = require("./blockDuties");
/**
 * Service that sets up and handles validator block proposal duties.
 */
class BlockProposingService {
    constructor(config, logger, api, clock, validatorStore, graffiti) {
        this.config = config;
        this.logger = logger;
        this.api = api;
        this.validatorStore = validatorStore;
        this.graffiti = graffiti;
        /**
         * `BlockDutiesService` must call this fn to trigger block creation
         * This function may run more than once at a time, rationale in `BlockDutiesService.pollBeaconProposers`
         */
        this.notifyBlockProductionFn = (slot, proposers) => {
            if (slot <= blockDuties_1.GENESIS_SLOT) {
                this.logger.debug("Not producing block before or at genesis slot");
                return;
            }
            if (proposers.length > 1) {
                this.logger.warn("Multiple block proposers", { slot, count: proposers.length });
            }
            Promise.all(proposers.map((pubkey) => this.createAndPublishBlock(pubkey, slot))).catch((e) => {
                this.logger.error("Error on block duties", { slot }, e);
            });
        };
        /** Wrapper around the API's different methods for producing blocks across forks */
        this.produceBlock = (slot, randaoReveal, graffiti) => {
            switch (this.config.getForkName(slot)) {
                case lodestar_params_1.ForkName.phase0:
                    return this.api.validator.produceBlock(slot, randaoReveal, graffiti);
                // All subsequent forks are expected to use v2 too
                case lodestar_params_1.ForkName.altair:
                default:
                    return this.api.validator.produceBlockV2(slot, randaoReveal, graffiti);
            }
        };
        this.dutiesService = new blockDuties_1.BlockDutiesService(logger, api, clock, validatorStore, this.notifyBlockProductionFn);
    }
    /** Produce a block at the given slot for pubkey */
    async createAndPublishBlock(pubkey, slot) {
        const pubkeyHex = (0, ssz_1.toHexString)(pubkey);
        const logCtx = { slot, validator: (0, lodestar_utils_1.prettyBytes)(pubkeyHex) };
        // Wrap with try catch here to re-use `logCtx`
        try {
            const randaoReveal = await this.validatorStore.signRandao(pubkey, slot);
            const graffiti = this.graffiti || "";
            const debugLogCtx = { ...logCtx, validator: pubkeyHex };
            this.logger.debug("Producing block", debugLogCtx);
            const block = await this.produceBlock(slot, randaoReveal, graffiti).catch((e) => {
                throw (0, util_1.extendError)(e, "Failed to produce block");
            });
            this.logger.debug("Produced block", debugLogCtx);
            const signedBlock = await this.validatorStore.signBlock(pubkey, block.data, slot);
            await this.api.beacon.publishBlock(signedBlock).catch((e) => {
                throw (0, util_1.extendError)(e, "Failed to publish block");
            });
            this.logger.info("Published block", { ...logCtx, graffiti });
        }
        catch (e) {
            this.logger.error("Error proposing block", logCtx, e);
        }
    }
}
exports.BlockProposingService = BlockProposingService;
//# sourceMappingURL=block.js.map