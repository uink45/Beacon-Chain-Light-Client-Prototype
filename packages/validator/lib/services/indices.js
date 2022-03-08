"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndicesService = void 0;
const ssz_1 = require("@chainsafe/ssz");
const batch_1 = require("../util/batch");
/**
 * URLs have a limitation on size, adding an unbounded num of pubkeys will break the request.
 * For reasoning on the specific number see: https://github.com/ChainSafe/lodestar/pull/2730#issuecomment-866749083
 */
const PUBKEYS_PER_REQUEST = 10;
class IndicesService {
    constructor(logger, api, validatorStore) {
        this.logger = logger;
        this.api = api;
        this.validatorStore = validatorStore;
        this.index2pubkey = new Map();
        /** Indexed by pubkey in hex 0x prefixed */
        this.pubkey2index = new Map();
        // Request indices once
        this.pollValidatorIndicesPromise = null;
    }
    /** Return all known indices from the validatorStore pubkeys */
    getAllLocalIndices() {
        return Array.from(this.index2pubkey.keys());
    }
    /** Return true if `index` is active part of this validator client */
    hasValidatorIndex(index) {
        return this.index2pubkey.has(index);
    }
    pollValidatorIndices() {
        // Ensures pollValidatorIndicesInternal() is not called more than once at the same time.
        // AttestationDutiesService and SyncCommitteeDutiesService will call this function at the same time, so this will
        // cache the promise and return it to the second caller, preventing calling the API twice for the same data.
        if (this.pollValidatorIndicesPromise) {
            return this.pollValidatorIndicesPromise;
        }
        this.pollValidatorIndicesPromise = this.pollValidatorIndicesInternal();
        // Once the pollValidatorIndicesInternal() resolves or rejects null the cached promise so it can be called again.
        this.pollValidatorIndicesPromise.finally(() => {
            this.pollValidatorIndicesPromise = null;
        });
        return this.pollValidatorIndicesPromise;
    }
    /** Iterate through all the voting pubkeys in the `ValidatorStore` and attempt to learn any unknown
        validator indices. Returns the new discovered indexes */
    async pollValidatorIndicesInternal() {
        const pubkeysHex = this.validatorStore.votingPubkeys().filter((pubkey) => !this.pubkey2index.has(pubkey));
        if (pubkeysHex.length === 0) {
            return [];
        }
        // Query the remote BN to resolve a pubkey to a validator index.
        // support up to 1000 pubkeys per poll
        const pubkeysHexBatches = (0, batch_1.batchItems)(pubkeysHex, { batchSize: PUBKEYS_PER_REQUEST });
        const newIndices = [];
        for (const pubkeysHexBatch of pubkeysHexBatches) {
            const validatorIndicesArr = await this.fetchValidatorIndices(pubkeysHexBatch);
            newIndices.push(...validatorIndicesArr);
        }
        this.logger.info("Discovered new validators", { count: newIndices.length });
        return newIndices;
    }
    async fetchValidatorIndices(pubkeysHex) {
        const validatorsState = await this.api.beacon.getStateValidators("head", { indices: pubkeysHex });
        const newIndices = [];
        for (const validatorState of validatorsState.data) {
            const pubkeyHex = (0, ssz_1.toHexString)(validatorState.validator.pubkey);
            if (!this.pubkey2index.has(pubkeyHex)) {
                this.logger.debug("Discovered validator", { pubkey: pubkeyHex, index: validatorState.index });
                this.pubkey2index.set(pubkeyHex, validatorState.index);
                this.index2pubkey.set(validatorState.index, pubkeyHex);
                newIndices.push(validatorState.index);
            }
        }
        return newIndices;
    }
}
exports.IndicesService = IndicesService;
//# sourceMappingURL=indices.js.map