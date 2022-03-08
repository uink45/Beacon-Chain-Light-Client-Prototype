"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processExecutionPayload = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
const util_1 = require("../../util");
const utils_1 = require("../utils");
function processExecutionPayload(state, payload, executionEngine) {
    // Verify consistency of the parent hash, block number, base fee per gas and gas limit
    // with respect to the previous execution payload header
    if ((0, utils_1.isMergeTransitionComplete)(state)) {
        const { latestExecutionPayloadHeader } = state;
        if (!(0, ssz_1.byteArrayEquals)(payload.parentHash, latestExecutionPayloadHeader.blockHash)) {
            throw Error(`Invalid execution payload parentHash ${(0, ssz_1.toHexString)(payload.parentHash)} latest blockHash ${(0, ssz_1.toHexString)(latestExecutionPayloadHeader.blockHash)}`);
        }
    }
    // Verify random
    const expectedRandom = (0, util_1.getRandaoMix)(state, state.currentShuffling.epoch);
    if (!(0, ssz_1.byteArrayEquals)(payload.prevRandao, expectedRandom)) {
        throw Error(`Invalid execution payload random ${(0, ssz_1.toHexString)(payload.prevRandao)} expected=${(0, ssz_1.toHexString)(expectedRandom)}`);
    }
    // Verify timestamp
    //
    // Note: inlined function in if statement
    // def compute_timestamp_at_slot(state: BeaconState, slot: Slot) -> uint64:
    //   slots_since_genesis = slot - GENESIS_SLOT
    //   return uint64(state.genesis_time + slots_since_genesis * SECONDS_PER_SLOT)
    if (payload.timestamp !== state.genesisTime + state.slot * state.config.SECONDS_PER_SLOT) {
        throw Error(`Invalid timestamp ${payload.timestamp} genesisTime=${state.genesisTime} slot=${state.slot}`);
    }
    // Verify the execution payload is valid
    //
    // if executionEngine is null, executionEngine.onPayload MUST be called after running processBlock to get the
    // correct randao mix. Since executionEngine will be an async call in most cases it is called afterwards to keep
    // the state transition sync
    if (executionEngine && !executionEngine.notifyNewPayload(payload)) {
        throw Error("Invalid execution payload");
    }
    // Cache execution payload header
    state.latestExecutionPayloadHeader = {
        parentHash: payload.parentHash,
        feeRecipient: payload.feeRecipient,
        stateRoot: payload.stateRoot,
        receiptsRoot: payload.receiptsRoot,
        logsBloom: payload.logsBloom,
        prevRandao: payload.prevRandao,
        blockNumber: payload.blockNumber,
        gasLimit: payload.gasLimit,
        gasUsed: payload.gasUsed,
        timestamp: payload.timestamp,
        extraData: payload.extraData,
        baseFeePerGas: payload.baseFeePerGas,
        blockHash: payload.blockHash,
        transactionsRoot: lodestar_types_1.ssz.bellatrix.Transactions.hashTreeRoot(payload.transactions),
    };
}
exports.processExecutionPayload = processExecutionPayload;
//# sourceMappingURL=processExecutionPayload.js.map