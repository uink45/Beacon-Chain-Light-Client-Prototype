"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
const worker_threads_1 = __importDefault(require("worker_threads"));
const worker_1 = require("threads/worker");
const bls_1 = require("@chainsafe/bls");
const maybeBatch_1 = require("../maybeBatch");
const types_1 = require("./types");
const utils_1 = require("./utils");
/**
 * Split batchable sets in chunks of minimum size 16.
 * Batch verify 16 has an aprox cost of 16+1. For 32 it's 32+1. After ~16 the additional savings are not significant.
 * However, if a sig is invalid the whole batch has to be re-verified. So it's important to keep this number low.
 * In normal network conditions almost all signatures received by the node are correct.
 * After observing metrics this number can be reviewed
 */
const BATCHABLE_MIN_PER_CHUNK = 16;
/* eslint-disable no-console */
// Cloned data from instatiation
const workerData = worker_threads_1.default.workerData;
if (!workerData)
    throw Error("workerData must be defined");
const { implementation, workerId } = workerData || {};
(0, worker_1.expose)({
    async verifyManySignatureSets(workReqArr) {
        await (0, bls_1.init)(implementation);
        return verifyManySignatureSets(workReqArr);
    },
});
function verifyManySignatureSets(workReqArr) {
    const startNs = process.hrtime.bigint();
    const results = [];
    let batchRetries = 0;
    let batchSigsSuccess = 0;
    // If there are multiple batchable sets attempt batch verification with them
    const batchableSets = [];
    const nonBatchableSets = [];
    // Split sets between batchable and non-batchable preserving their original index in the req array
    for (let i = 0; i < workReqArr.length; i++) {
        const workReq = workReqArr[i];
        const sets = workReq.sets.map(deserializeSet);
        if (workReq.opts.batchable) {
            batchableSets.push({ idx: i, sets });
        }
        else {
            nonBatchableSets.push({ idx: i, sets });
        }
    }
    if (batchableSets.length > 0) {
        // Split batchable into chunks of max size ~ 32 to minimize cost if a sig is wrong
        const batchableChunks = (0, utils_1.chunkifyMaximizeChunkSize)(batchableSets, BATCHABLE_MIN_PER_CHUNK);
        for (const batchableChunk of batchableChunks) {
            const allSets = [];
            for (const { sets } of batchableChunk) {
                for (const set of sets) {
                    allSets.push(set);
                }
            }
            try {
                // Attempt to verify multiple sets at once
                const isValid = (0, maybeBatch_1.verifySignatureSetsMaybeBatch)(allSets);
                if (isValid) {
                    // The entire batch is valid, return success to all
                    for (const { idx, sets } of batchableChunk) {
                        batchSigsSuccess += sets.length;
                        results[idx] = { code: types_1.WorkResultCode.success, result: isValid };
                    }
                }
                else {
                    batchRetries++;
                    // Re-verify all sigs
                    nonBatchableSets.push(...batchableChunk);
                }
            }
            catch (e) {
                // TODO: Ignore this error expecting that the same error will happen when re-verifying the set individually
                //       It's not ideal but '@chainsafe/blst' may throw errors on some conditions
                batchRetries++;
                // Re-verify all sigs
                nonBatchableSets.push(...batchableChunk);
            }
        }
    }
    for (const { idx, sets } of nonBatchableSets) {
        try {
            const isValid = (0, maybeBatch_1.verifySignatureSetsMaybeBatch)(sets);
            results[idx] = { code: types_1.WorkResultCode.success, result: isValid };
        }
        catch (e) {
            results[idx] = { code: types_1.WorkResultCode.error, error: e };
        }
    }
    return {
        workerId,
        batchRetries,
        batchSigsSuccess,
        workerStartNs: startNs,
        workerEndNs: process.hrtime.bigint(),
        results,
    };
}
function deserializeSet(set) {
    return {
        publicKey: bls_1.bls.PublicKey.fromBytes(set.publicKey, bls_1.CoordType.affine),
        message: set.message,
        signature: set.signature,
    };
}
//# sourceMappingURL=worker.js.map