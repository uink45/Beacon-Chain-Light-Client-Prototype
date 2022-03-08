export declare enum Bucket {
    allForks_stateArchive = 0,
    allForks_block = 1,
    allForks_blockArchive = 2,
    index_blockArchiveParentRootIndex = 3,
    index_blockArchiveRootIndex = 4,
    index_mainChain = 6,
    index_chainInfo = 7,
    phase0_eth1Data = 8,
    index_depositDataRoot = 9,
    phase0_depositEvent = 19,
    phase0_preGenesisState = 30,
    phase0_preGenesisStateLastProcessedBlock = 31,
    phase0_depositData = 12,
    phase0_exit = 13,
    phase0_proposerSlashing = 14,
    phase0_attesterSlashing = 15,
    phase0_slashingProtectionBlockBySlot = 20,
    phase0_slashingProtectionAttestationByTarget = 21,
    phase0_slashingProtectionAttestationLowerBound = 22,
    index_slashingProtectionMinSpanDistance = 23,
    index_slashingProtectionMaxSpanDistance = 24,
    index_stateArchiveRootIndex = 26,
    lightClient_syncCommitteeWitness = 51,
    lightClient_syncCommittee = 52,
    lightClient_checkpointHeader = 53,
    lightClient_bestPartialLightClientUpdate = 54,
    validator_metaData = 41,
    backfilled_ranges = 42
}
export declare enum Key {
    chainHeight = 0,
    latestState = 1,
    finalizedState = 2,
    justifiedState = 3,
    finalizedBlock = 4,
    justifiedBlock = 5
}
export declare const uintLen = 8;
/**
 * Prepend a bucket to a key
 */
export declare function encodeKey(bucket: Bucket, key: Uint8Array | string | number | bigint): Uint8Array;
//# sourceMappingURL=schema.d.ts.map