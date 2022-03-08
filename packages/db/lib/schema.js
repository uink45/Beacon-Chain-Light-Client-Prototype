"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeKey = exports.uintLen = exports.Key = exports.Bucket = void 0;
/**
 * @module db/schema
 */
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const const_1 = require("./const");
// Buckets are separate database namespaces
var Bucket;
(function (Bucket) {
    // beacon chain
    // finalized states
    Bucket[Bucket["allForks_stateArchive"] = 0] = "allForks_stateArchive";
    // unfinalized blocks
    Bucket[Bucket["allForks_block"] = 1] = "allForks_block";
    // finalized blocks
    Bucket[Bucket["allForks_blockArchive"] = 2] = "allForks_blockArchive";
    // finalized block additional indices
    Bucket[Bucket["index_blockArchiveParentRootIndex"] = 3] = "index_blockArchiveParentRootIndex";
    Bucket[Bucket["index_blockArchiveRootIndex"] = 4] = "index_blockArchiveRootIndex";
    // known bad block
    // index_invalidBlock = 5, // DEPRECATED on v0.25.0
    // finalized chain
    Bucket[Bucket["index_mainChain"] = 6] = "index_mainChain";
    // justified, finalized state and block hashes
    Bucket[Bucket["index_chainInfo"] = 7] = "index_chainInfo";
    // eth1 processing
    Bucket[Bucket["phase0_eth1Data"] = 8] = "phase0_eth1Data";
    Bucket[Bucket["index_depositDataRoot"] = 9] = "index_depositDataRoot";
    Bucket[Bucket["phase0_depositEvent"] = 19] = "phase0_depositEvent";
    Bucket[Bucket["phase0_preGenesisState"] = 30] = "phase0_preGenesisState";
    Bucket[Bucket["phase0_preGenesisStateLastProcessedBlock"] = 31] = "phase0_preGenesisStateLastProcessedBlock";
    // op pool
    // phase0_attestation = 10, // DEPRECATED on v0.25.0
    // phase0_aggregateAndProof = 11, // Root -> AggregateAndProof, DEPRECATED on v.27.0
    Bucket[Bucket["phase0_depositData"] = 12] = "phase0_depositData";
    Bucket[Bucket["phase0_exit"] = 13] = "phase0_exit";
    Bucket[Bucket["phase0_proposerSlashing"] = 14] = "phase0_proposerSlashing";
    Bucket[Bucket["phase0_attesterSlashing"] = 15] = "phase0_attesterSlashing";
    // validator
    // validator = 16, // DEPRECATED on v0.11.0
    // lastProposedBlock = 17, // DEPRECATED on v0.11.0
    // proposedAttestations = 18, // DEPRECATED on v0.11.0
    // validator slashing protection
    Bucket[Bucket["phase0_slashingProtectionBlockBySlot"] = 20] = "phase0_slashingProtectionBlockBySlot";
    Bucket[Bucket["phase0_slashingProtectionAttestationByTarget"] = 21] = "phase0_slashingProtectionAttestationByTarget";
    Bucket[Bucket["phase0_slashingProtectionAttestationLowerBound"] = 22] = "phase0_slashingProtectionAttestationLowerBound";
    Bucket[Bucket["index_slashingProtectionMinSpanDistance"] = 23] = "index_slashingProtectionMinSpanDistance";
    Bucket[Bucket["index_slashingProtectionMaxSpanDistance"] = 24] = "index_slashingProtectionMaxSpanDistance";
    // allForks_pendingBlock = 25, // Root -> SignedBeaconBlock // DEPRECATED on v0.30.0
    Bucket[Bucket["index_stateArchiveRootIndex"] = 26] = "index_stateArchiveRootIndex";
    // Lightclient server
    // altair_bestUpdatePerCommitteePeriod = 30, // DEPRECATED on v0.32.0
    // altair_latestFinalizedUpdate = 31, // DEPRECATED on v0.32.0
    // altair_latestNonFinalizedUpdate = 32, // DEPRECATED on v0.32.0
    // altair_lightclientFinalizedCheckpoint = 33, // DEPRECATED on v0.32.0
    // altair_lightClientInitProof = 34, // DEPRECATED on v0.32.0
    // altair_lightClientSyncCommitteeProof = 35, // DEPRECATED on v0.32.0
    // index_lightClientInitProof = 36, // DEPRECATED on v0.32.0
    // Buckets to support LightClient server v2
    Bucket[Bucket["lightClient_syncCommitteeWitness"] = 51] = "lightClient_syncCommitteeWitness";
    Bucket[Bucket["lightClient_syncCommittee"] = 52] = "lightClient_syncCommittee";
    // TODO: May be redundant to block stores
    Bucket[Bucket["lightClient_checkpointHeader"] = 53] = "lightClient_checkpointHeader";
    Bucket[Bucket["lightClient_bestPartialLightClientUpdate"] = 54] = "lightClient_bestPartialLightClientUpdate";
    Bucket[Bucket["validator_metaData"] = 41] = "validator_metaData";
    Bucket[Bucket["backfilled_ranges"] = 42] = "backfilled_ranges";
})(Bucket = exports.Bucket || (exports.Bucket = {}));
var Key;
(function (Key) {
    Key[Key["chainHeight"] = 0] = "chainHeight";
    Key[Key["latestState"] = 1] = "latestState";
    Key[Key["finalizedState"] = 2] = "finalizedState";
    Key[Key["justifiedState"] = 3] = "justifiedState";
    Key[Key["finalizedBlock"] = 4] = "finalizedBlock";
    Key[Key["justifiedBlock"] = 5] = "justifiedBlock";
})(Key = exports.Key || (exports.Key = {}));
exports.uintLen = 8;
/**
 * Prepend a bucket to a key
 */
function encodeKey(bucket, key) {
    let buf;
    const prefixLength = const_1.BUCKET_LENGTH;
    //all keys are writen with prefixLength offet
    if (typeof key === "string") {
        buf = Buffer.alloc(key.length + prefixLength);
        buf.write(key, prefixLength);
    }
    else if (typeof key === "number" || typeof key === "bigint") {
        buf = Buffer.alloc(exports.uintLen + prefixLength);
        (0, lodestar_utils_1.intToBytes)(BigInt(key), exports.uintLen, "be").copy(buf, prefixLength);
    }
    else {
        buf = Buffer.alloc(key.length + prefixLength);
        buf.set(key, prefixLength);
    }
    //bucket prefix on position 0
    buf.set((0, lodestar_utils_1.intToBytes)(bucket, const_1.BUCKET_LENGTH, "le"), 0);
    return buf;
}
exports.encodeKey = encodeKey;
//# sourceMappingURL=schema.js.map