"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionEngineMock = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const ssz_1 = require("@chainsafe/ssz");
const constants_1 = require("../constants");
const interface_1 = require("./interface");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const INTEROP_GAS_LIMIT = 30e6;
/**
 * Mock ExecutionEngine for fast prototyping and unit testing
 */
class ExecutionEngineMock {
    constructor(opts) {
        // Public state to check if notifyForkchoiceUpdate() is called properly
        this.headBlockRoot = constants_1.ZERO_HASH_HEX;
        this.finalizedBlockRoot = constants_1.ZERO_HASH_HEX;
        this.knownBlocks = new Map();
        this.preparingPayloads = new Map();
        this.payloadId = 0;
        this.knownBlocks.set(opts.genesisBlockHash, {
            parentHash: constants_1.ZERO_HASH,
            feeRecipient: Buffer.alloc(20, 0),
            stateRoot: constants_1.ZERO_HASH,
            receiptsRoot: constants_1.ZERO_HASH,
            logsBloom: Buffer.alloc(lodestar_params_1.BYTES_PER_LOGS_BLOOM, 0),
            prevRandao: constants_1.ZERO_HASH,
            blockNumber: 0,
            gasLimit: INTEROP_GAS_LIMIT,
            gasUsed: 0,
            timestamp: 0,
            extraData: constants_1.ZERO_HASH,
            baseFeePerGas: BigInt(0),
            blockHash: constants_1.ZERO_HASH,
            transactions: [],
        });
    }
    /**
     * `engine_newPayloadV1`
     *
     * 1. Client software MUST validate the payload according to the execution environment rule set with modifications to this rule set defined in the Block Validity section of EIP-3675 and respond with the validation result.
     * 2. Client software MUST defer persisting a valid payload until the corresponding engine_consensusValidated message deems the payload valid with respect to the proof-of-stake consensus rules.
     * 3. Client software MUST discard the payload if it's deemed invalid.
     * 4. The call MUST be responded with SYNCING status while the sync process is in progress and thus the execution cannot yet be validated.
     * 5. In the case when the parent block is unknown, client software MUST pull the block from the network and take one of the following actions depending on the parent block properties:
     * 6. If the parent block is a PoW block as per EIP-3675 definition, then all missing dependencies of the payload MUST be pulled from the network and validated accordingly. The call MUST be responded according to the validity of the payload and the chain of its ancestors.
     *    If the parent block is a PoS block as per EIP-3675 definition, then the call MAY be responded with SYNCING status and sync process SHOULD be initiated accordingly.
     */
    async notifyNewPayload(executionPayload) {
        // Only validate that parent is known
        if (!this.knownBlocks.has((0, ssz_1.toHexString)(executionPayload.parentHash))) {
            return { status: interface_1.ExecutePayloadStatus.INVALID, latestValidHash: this.headBlockRoot, validationError: null };
        }
        this.knownBlocks.set((0, ssz_1.toHexString)(executionPayload.blockHash), executionPayload);
        return {
            status: interface_1.ExecutePayloadStatus.VALID,
            latestValidHash: (0, ssz_1.toHexString)(executionPayload.blockHash),
            validationError: null,
        };
    }
    /**
     * `engine_forkchoiceUpdated`
     *
     * 1. This method call maps on the POS_FORKCHOICE_UPDATED event of EIP-3675 and MUST be processed according to the specification defined in the EIP.
     * 2. Client software MUST respond with 4: Unknown block error if the payload identified by either the headBlockHash or the finalizedBlockHash is unknown.
     */
    async notifyForkchoiceUpdate(headBlockHash, finalizedBlockHash, payloadAttributes) {
        const headBlockHashHex = (0, ssz_1.toHexString)(headBlockHash);
        if (!this.knownBlocks.has(headBlockHashHex)) {
            throw Error(`Unknown headBlockHash ${headBlockHashHex}`);
        }
        if (!this.knownBlocks.has(finalizedBlockHash)) {
            throw Error(`Unknown finalizedBlockHash ${finalizedBlockHash}`);
        }
        this.headBlockRoot = headBlockHashHex;
        this.finalizedBlockRoot = finalizedBlockHash;
        const parentHashHex = headBlockHashHex;
        const parentPayload = this.knownBlocks.get(parentHashHex);
        if (!parentPayload) {
            throw Error(`Unknown parentHash ${parentHashHex}`);
        }
        if (!payloadAttributes)
            throw Error("InvalidPayloadAttributes");
        const payloadId = this.payloadId++;
        const payload = {
            parentHash: headBlockHash,
            feeRecipient: payloadAttributes.suggestedFeeRecipient,
            stateRoot: node_crypto_1.default.randomBytes(32),
            receiptsRoot: node_crypto_1.default.randomBytes(32),
            logsBloom: node_crypto_1.default.randomBytes(lodestar_params_1.BYTES_PER_LOGS_BLOOM),
            prevRandao: payloadAttributes.prevRandao,
            blockNumber: parentPayload.blockNumber + 1,
            gasLimit: INTEROP_GAS_LIMIT,
            gasUsed: Math.floor(0.5 * INTEROP_GAS_LIMIT),
            timestamp: payloadAttributes.timestamp,
            extraData: constants_1.ZERO_HASH,
            baseFeePerGas: BigInt(0),
            blockHash: node_crypto_1.default.randomBytes(32),
            transactions: [node_crypto_1.default.randomBytes(512)],
        };
        this.preparingPayloads.set(payloadId, payload);
        return payloadId.toString();
    }
    /**
     * `engine_getPayload`
     *
     * 1. Given the payloadId client software MUST respond with the most recent version of the payload that is available in the corresponding building process at the time of receiving the call.
     * 2. The call MUST be responded with 5: Unavailable payload error if the building process identified by the payloadId doesn't exist.
     * 3. Client software MAY stop the corresponding building process after serving this call.
     */
    async getPayload(payloadId) {
        const payloadIdNbr = Number(payloadId);
        const payload = this.preparingPayloads.get(payloadIdNbr);
        if (!payload) {
            throw Error(`Unknown payloadId ${payloadId}`);
        }
        this.preparingPayloads.delete(payloadIdNbr);
        return payload;
    }
}
exports.ExecutionEngineMock = ExecutionEngineMock;
//# sourceMappingURL=mock.js.map