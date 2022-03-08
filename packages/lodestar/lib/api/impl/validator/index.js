"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidatorApi = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_fork_choice_1 = require("@chainsafe/lodestar-fork-choice");
const block_1 = require("../../../chain/factory/block");
const errors_1 = require("../../../chain/errors");
const validation_1 = require("../../../chain/validation");
const constants_1 = require("../../../constants");
const sync_1 = require("../../../sync");
const graffiti_1 = require("../../../util/graffiti");
const errors_2 = require("../errors");
const syncCommitteeContributionAndProof_1 = require("../../../chain/validation/syncCommitteeContributionAndProof");
const validatorMonitor_1 = require("../../../metrics/validatorMonitor");
const utils_1 = require("./utils");
const regen_1 = require("../../../chain/regen");
const ssz_1 = require("@chainsafe/ssz");
/**
 * Validator clock may be advanced from beacon's clock. If the validator requests a resource in a
 * future slot, wait some time instead of rejecting the request because it's in the future
 */
const MAX_API_CLOCK_DISPARITY_MS = 1000;
/**
 * If the node is within this many epochs from the head, we declare it to be synced regardless of
 * the network sync state.
 *
 * This helps prevent attacks where nodes can convince us that we're syncing some non-existent
 * finalized head.
 *
 * TODO: Lighthouse uses 8 for the attack described above. However, 8 kills Lodestar since validators
 * can trigger regen to fast-forward head state 8 epochs to be immediatelly invalidated as sync sets
 * a new head. Then the checkpoint state cache grows unbounded with very different states (because
 * they are 8 epochs apart) and causes an OOM. Research a proper solution once regen and the state
 * caches are better.
 */
const SYNC_TOLERANCE_EPOCHS = 1;
/**
 * Server implementation for handling validator duties.
 * See `@chainsafe/lodestar-validator/src/api` for the client implementation).
 */
function getValidatorApi({ chain, config, logger, metrics, network, sync }) {
    let genesisBlockRoot = null;
    /** Compute and cache the genesis block root */
    async function getGenesisBlockRoot(state) {
        if (!genesisBlockRoot) {
            // Close to genesis the genesis block may not be available in the DB
            if (state.slot < lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT) {
                genesisBlockRoot = state.blockRoots[0];
            }
            const genesisBlock = await chain.getCanonicalBlockAtSlot(lodestar_params_1.GENESIS_SLOT);
            if (genesisBlock) {
                genesisBlockRoot = config.getForkTypes(genesisBlock.message.slot).SignedBeaconBlock.hashTreeRoot(genesisBlock);
            }
        }
        // If for some reason the genesisBlockRoot is not able don't prevent validators from
        // proposing or attesting. If the genesisBlockRoot is wrong, at worst it may trigger a re-fetch of the duties
        return genesisBlockRoot || constants_1.ZERO_HASH;
    }
    /**
     * If advancing the local clock `MAX_API_CLOCK_DISPARITY_MS` ticks to the requested slot, wait for its start
     * Prevents the validator from getting errors from the API if the clock is a bit advanced
     */
    async function waitForSlot(slot) {
        const slotStartSec = chain.genesisTime + slot * config.SECONDS_PER_SLOT;
        const msToSlot = slotStartSec * 1000 - Date.now();
        if (msToSlot > 0 && msToSlot < MAX_API_CLOCK_DISPARITY_MS) {
            await chain.clock.waitForSlot(slot);
        }
    }
    /**
     * If advancing the local clock `MAX_API_CLOCK_DISPARITY_MS` ticks to the next epoch, wait for slot 0 of the next epoch.
     * Prevents a validator from not being able to get the attestater duties correctly if the beacon and validator clocks are off
     */
    async function waitForNextClosestEpoch() {
        const nextEpoch = chain.clock.currentEpoch + 1;
        const secPerEpoch = lodestar_params_1.SLOTS_PER_EPOCH * config.SECONDS_PER_SLOT;
        const nextEpochStartSec = chain.genesisTime + nextEpoch * secPerEpoch;
        const msToNextEpoch = nextEpochStartSec * 1000 - Date.now();
        if (msToNextEpoch > 0 && msToNextEpoch < MAX_API_CLOCK_DISPARITY_MS) {
            await chain.clock.waitForSlot((0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(nextEpoch));
        }
    }
    /**
     * Reject any request while the node is syncing
     */
    function notWhileSyncing() {
        // Consider node synced before or close to genesis
        if (chain.clock.currentSlot < lodestar_params_1.SLOTS_PER_EPOCH) {
            return;
        }
        const syncState = sync.state;
        switch (syncState) {
            case sync_1.SyncState.SyncingFinalized:
            case sync_1.SyncState.SyncingHead: {
                const currentSlot = chain.clock.currentSlot;
                const headSlot = chain.forkChoice.getHead().slot;
                if (currentSlot - headSlot > SYNC_TOLERANCE_EPOCHS * lodestar_params_1.SLOTS_PER_EPOCH) {
                    throw new errors_2.NodeIsSyncing(`headSlot ${headSlot} currentSlot ${currentSlot}`);
                }
                else {
                    return;
                }
            }
            case sync_1.SyncState.Synced:
                return;
            case sync_1.SyncState.Stalled:
                throw new errors_2.NodeIsSyncing("waiting for peers");
        }
    }
    /**
     * Post merge, the CL and EL could be out of step in the sync, and could result in
     * Syncing status of the chain head. To be precise:
     * 1. CL could be ahead of the EL, with the validity of head payload not yet verified
     * 2. CL could be on an invalid chain of execution blocks with a non-existent
     *    or non-available parent that never syncs up
     *
     * Both the above scenarios could be problematic and hence validator shouldn't participate
     * or weigh its vote on a head till it resolves to a Valid execution status.
     * Following activities should be skipped on an Optimistic head (with Syncing status):
     * 1. Attestation if targetRoot is optimistic
     * 2. SyncCommitteeContribution if if the root for which to produce contribution is Optimistic.
     * 3. ProduceBlock if the parentRoot (chain's current head is optimistic). However this doesn't
     *    need to be checked/aborted here as assembleBody would call EL's api for the latest
     *    executionStatus of the parentRoot. If still not validated, produceBlock will throw error.
     *
     * TODO/PENDING: SyncCommitteeSignatures should also be aborted, the best way to address this
     *   is still in flux and will be updated as and when other CL's figure this out.
     */
    function notOnOptimisticBlockRoot(beaconBlockRoot) {
        const protoBeaconBlock = chain.forkChoice.getBlock(beaconBlockRoot);
        if (!protoBeaconBlock) {
            throw new errors_2.ApiError(400, "Block not in forkChoice");
        }
        if (protoBeaconBlock.executionStatus === lodestar_fork_choice_1.ExecutionStatus.Syncing)
            throw new errors_2.NodeIsSyncing(`Block's execution payload not yet validated, executionPayloadBlockHash=${protoBeaconBlock.executionPayloadBlockHash}`);
    }
    const produceBlock = async function produceBlock(slot, randaoReveal, graffiti) {
        let timer;
        metrics === null || metrics === void 0 ? void 0 : metrics.blockProductionRequests.inc();
        try {
            notWhileSyncing();
            await waitForSlot(slot); // Must never request for a future slot > currentSlot
            timer = metrics === null || metrics === void 0 ? void 0 : metrics.blockProductionTime.startTimer();
            const block = await (0, block_1.assembleBlock)({ chain, metrics }, {
                slot,
                randaoReveal,
                graffiti: (0, graffiti_1.toGraffitiBuffer)(graffiti || ""),
                // TODO - TEMP
                feeRecipient: Buffer.alloc(20, 0),
            });
            metrics === null || metrics === void 0 ? void 0 : metrics.blockProductionSuccess.inc();
            return { data: block, version: config.getForkName(block.slot) };
        }
        finally {
            if (timer)
                timer();
        }
    };
    return {
        produceBlock: produceBlock,
        produceBlockV2: produceBlock,
        async produceAttestationData(committeeIndex, slot) {
            notWhileSyncing();
            await waitForSlot(slot); // Must never request for a future slot > currentSlot
            // This needs a state in the same epoch as `slot` such that state.currentJustifiedCheckpoint is correct.
            // Note: This may trigger an epoch transition if there skipped slots at the begining of the epoch.
            const headState = chain.getHeadState();
            const headSlot = headState.slot;
            const attEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot);
            const headEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(headSlot);
            const headBlockRootHex = chain.forkChoice.getHead().blockRoot;
            const headBlockRoot = (0, ssz_1.fromHexString)(headBlockRootHex);
            const beaconBlockRoot = slot >= headSlot
                ? // When attesting to the head slot or later, always use the head of the chain.
                    headBlockRoot
                : // Permit attesting to slots *prior* to the current head. This is desirable when
                    // the VC and BN are out-of-sync due to time issues or overloading.
                    (0, lodestar_beacon_state_transition_1.getBlockRootAtSlot)(headState, slot);
            const targetSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(attEpoch);
            const targetRoot = targetSlot >= headSlot
                ? // If the state is earlier than the target slot then the target *must* be the head block root.
                    headBlockRoot
                : (0, lodestar_beacon_state_transition_1.getBlockRootAtSlot)(headState, targetSlot);
            // Check the execution status as validator shouldn't vote on an optimistic head
            // Check on target is sufficient as a valid target would imply a valid source
            notOnOptimisticBlockRoot(targetRoot);
            // To get the correct source we must get a state in the same epoch as the attestation's epoch.
            // An epoch transition may change state.currentJustifiedCheckpoint
            const attEpochState = attEpoch <= headEpoch
                ? headState
                : // Will advance the state to the correct next epoch if necessary
                    await chain.regen.getBlockSlotState(headBlockRootHex, slot, regen_1.RegenCaller.produceAttestationData);
            return {
                data: {
                    slot,
                    index: committeeIndex,
                    beaconBlockRoot,
                    source: attEpochState.currentJustifiedCheckpoint,
                    target: { epoch: attEpoch, root: targetRoot },
                },
            };
        },
        /**
         * GET `/eth/v1/validator/sync_committee_contribution`
         *
         * Requests that the beacon node produce a sync committee contribution.
         *
         * https://github.com/ethereum/eth2.0-APIs/pull/138
         *
         * @param slot The slot for which a sync committee contribution should be created.
         * @param subcommitteeIndex The subcommittee index for which to produce the contribution.
         * @param beaconBlockRoot The block root for which to produce the contribution.
         */
        async produceSyncCommitteeContribution(slot, subcommitteeIndex, beaconBlockRoot) {
            // Check the execution status as validator shouldn't contribute on an optimistic head
            notOnOptimisticBlockRoot(beaconBlockRoot);
            const contribution = chain.syncCommitteeMessagePool.getContribution(subcommitteeIndex, slot, beaconBlockRoot);
            if (!contribution)
                throw new errors_2.ApiError(500, "No contribution available");
            return { data: contribution };
        },
        async getProposerDuties(epoch) {
            notWhileSyncing();
            const startSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(epoch);
            await waitForSlot(startSlot); // Must never request for a future slot > currentSlot
            const state = await chain.getHeadStateAtCurrentEpoch();
            const duties = [];
            const indexes = [];
            // Gather indexes to get pubkeys in batch (performance optimization)
            for (let i = 0; i < lodestar_params_1.SLOTS_PER_EPOCH; i++) {
                // getBeaconProposer ensures the requested epoch is correct
                const validatorIndex = state.getBeaconProposer(startSlot + i);
                indexes.push(validatorIndex);
            }
            // NOTE: this is the fastest way of getting compressed pubkeys.
            //       See benchmark -> packages/lodestar/test/perf/api/impl/validator/attester.test.ts
            // After dropping the flat caches attached to the CachedBeaconState it's no longer available.
            // TODO: Add a flag to just send 0x00 as pubkeys since the Lodestar validator does not need them.
            const pubkeys = (0, utils_1.getPubkeysForIndices)(state.validators, indexes);
            for (let i = 0; i < lodestar_params_1.SLOTS_PER_EPOCH; i++) {
                duties.push({ slot: startSlot + i, validatorIndex: indexes[i], pubkey: pubkeys[i] });
            }
            // Returns `null` on the one-off scenario where the genesis block decides its own shuffling.
            // It should be set to the latest block applied to `self` or the genesis block root.
            const dependentRoot = (0, lodestar_beacon_state_transition_1.proposerShufflingDecisionRoot)(state) || (await getGenesisBlockRoot(state));
            return {
                data: duties,
                dependentRoot,
            };
        },
        async getAttesterDuties(epoch, validatorIndices) {
            notWhileSyncing();
            if (validatorIndices.length === 0) {
                throw new errors_2.ApiError(400, "No validator to get attester duties");
            }
            // May request for an epoch that's in the future
            await waitForNextClosestEpoch();
            // should not compare to headEpoch in order to handle skipped slots
            // Check if the epoch is in the future after waiting for requested slot
            if (epoch > chain.clock.currentEpoch + 1) {
                throw new errors_2.ApiError(400, "Cannot get duties for epoch more than one ahead");
            }
            const state = await chain.getHeadStateAtCurrentEpoch();
            // TODO: Determine what the current epoch would be if we fast-forward our system clock by
            // `MAXIMUM_GOSSIP_CLOCK_DISPARITY`.
            //
            // Most of the time, `tolerantCurrentEpoch` will be equal to `currentEpoch`. However, during
            // the first `MAXIMUM_GOSSIP_CLOCK_DISPARITY` duration of the epoch `tolerantCurrentEpoch`
            // will equal `currentEpoch + 1`
            // Check that all validatorIndex belong to the state before calling getCommitteeAssignments()
            const pubkeys = (0, utils_1.getPubkeysForIndices)(state.validators, validatorIndices);
            const committeeAssignments = state.epochCtx.getCommitteeAssignments(epoch, validatorIndices);
            const duties = [];
            for (let i = 0, len = validatorIndices.length; i < len; i++) {
                const validatorIndex = validatorIndices[i];
                const duty = committeeAssignments.get(validatorIndex);
                if (duty) {
                    // Mutate existing object instead of re-creating another new object with spread operator
                    // Should be faster and require less memory
                    duty.pubkey = pubkeys[i];
                    duties.push(duty);
                }
            }
            const dependentRoot = (0, lodestar_beacon_state_transition_1.attesterShufflingDecisionRoot)(state, epoch) || (await getGenesisBlockRoot(state));
            return {
                data: duties,
                dependentRoot,
            };
        },
        /**
         * `POST /eth/v1/validator/duties/sync/{epoch}`
         *
         * Requests the beacon node to provide a set of sync committee duties for a particular epoch.
         * - Although pubkey can be inferred from the index we return it to keep this call analogous with the one that
         *   fetches attester duties.
         * - `sync_committee_index` is the index of the validator in the sync committee. This can be used to infer the
         *   subnet to which the contribution should be broadcast. Note, there can be multiple per validator.
         *
         * https://github.com/ethereum/eth2.0-APIs/pull/134
         *
         * @param validatorIndices an array of the validator indices for which to obtain the duties.
         */
        async getSyncCommitteeDuties(epoch, validatorIndices) {
            notWhileSyncing();
            if (validatorIndices.length === 0) {
                throw new errors_2.ApiError(400, "No validator to get attester duties");
            }
            // May request for an epoch that's in the future
            await waitForNextClosestEpoch();
            // sync committee duties have a lookahead of 1 day. Assuming the validator only requests duties for upcomming
            // epochs, the head state will very likely have the duties available for the requested epoch.
            // Note: does not support requesting past duties
            const state = chain.getHeadState();
            // Check that all validatorIndex belong to the state before calling getCommitteeAssignments()
            const pubkeys = (0, utils_1.getPubkeysForIndices)(state.validators, validatorIndices);
            // Ensures `epoch // EPOCHS_PER_SYNC_COMMITTEE_PERIOD <= current_epoch // EPOCHS_PER_SYNC_COMMITTEE_PERIOD + 1`
            const syncCommitteeCache = state.epochCtx.getIndexedSyncCommitteeAtEpoch(epoch);
            const syncComitteeValidatorIndexMap = syncCommitteeCache.validatorIndexMap;
            const duties = [];
            for (let i = 0, len = validatorIndices.length; i < len; i++) {
                const validatorIndex = validatorIndices[i];
                const validatorSyncCommitteeIndices = syncComitteeValidatorIndexMap.get(validatorIndex);
                if (validatorSyncCommitteeIndices) {
                    duties.push({
                        pubkey: pubkeys[i],
                        validatorIndex,
                        validatorSyncCommitteeIndices,
                    });
                }
            }
            return {
                data: duties,
                // TODO: Compute a proper dependentRoot for this syncCommittee shuffling
                dependentRoot: constants_1.ZERO_HASH,
            };
        },
        async getAggregatedAttestation(attestationDataRoot, slot) {
            notWhileSyncing();
            await waitForSlot(slot); // Must never request for a future slot > currentSlot
            return {
                data: chain.attestationPool.getAggregate(slot, attestationDataRoot),
            };
        },
        async publishAggregateAndProofs(signedAggregateAndProofs) {
            notWhileSyncing();
            const seenTimestampSec = Date.now() / 1000;
            const errors = [];
            await Promise.all(signedAggregateAndProofs.map(async (signedAggregateAndProof, i) => {
                try {
                    // TODO: Validate in batch
                    const { indexedAttestation, committeeIndices } = await (0, validation_1.validateGossipAggregateAndProof)(chain, signedAggregateAndProof);
                    metrics === null || metrics === void 0 ? void 0 : metrics.registerAggregatedAttestation(validatorMonitor_1.OpSource.api, seenTimestampSec, signedAggregateAndProof, indexedAttestation);
                    await Promise.all([
                        chain.aggregatedAttestationPool.add(signedAggregateAndProof.message.aggregate, indexedAttestation.attestingIndices.valueOf(), committeeIndices),
                        network.gossip.publishBeaconAggregateAndProof(signedAggregateAndProof),
                    ]);
                }
                catch (e) {
                    if (e instanceof errors_1.AttestationError && e.type.code === errors_1.AttestationErrorCode.AGGREGATOR_ALREADY_KNOWN) {
                        logger.debug("Ignoring known signedAggregateAndProof");
                        return; // Ok to submit the same aggregate twice
                    }
                    errors.push(e);
                    logger.error(`Error on publishAggregateAndProofs [${i}]`, {
                        slot: signedAggregateAndProof.message.aggregate.data.slot,
                        index: signedAggregateAndProof.message.aggregate.data.index,
                    }, e);
                    if (e instanceof errors_1.AttestationError && e.action === errors_1.GossipAction.REJECT) {
                        const archivedPath = chain.persistInvalidSszObject("signedAggregatedAndProof", lodestar_types_1.ssz.phase0.SignedAggregateAndProof.serialize(signedAggregateAndProof), (0, ssz_1.toHexString)(lodestar_types_1.ssz.phase0.SignedAggregateAndProof.hashTreeRoot(signedAggregateAndProof)));
                        logger.debug("The submitted signed aggregate and proof was written to", archivedPath);
                    }
                }
            }));
            if (errors.length > 1) {
                throw Error("Multiple errors on publishAggregateAndProofs\n" + errors.map((e) => e.message).join("\n"));
            }
            else if (errors.length === 1) {
                throw errors[0];
            }
        },
        /**
         * POST `/eth/v1/validator/contribution_and_proofs`
         *
         * Publish multiple signed sync committee contribution and proofs
         *
         * https://github.com/ethereum/eth2.0-APIs/pull/137
         */
        async publishContributionAndProofs(contributionAndProofs) {
            notWhileSyncing();
            const errors = [];
            await Promise.all(contributionAndProofs.map(async (contributionAndProof, i) => {
                try {
                    // TODO: Validate in batch
                    const { syncCommitteeParticipants } = await (0, syncCommitteeContributionAndProof_1.validateSyncCommitteeGossipContributionAndProof)(chain, contributionAndProof);
                    chain.syncContributionAndProofPool.add(contributionAndProof.message, syncCommitteeParticipants);
                    await network.gossip.publishContributionAndProof(contributionAndProof);
                }
                catch (e) {
                    errors.push(e);
                    logger.error(`Error on publishContributionAndProofs [${i}]`, {
                        slot: contributionAndProof.message.contribution.slot,
                        subcommitteeIndex: contributionAndProof.message.contribution.subcommitteeIndex,
                    }, e);
                    if (e instanceof errors_1.SyncCommitteeError && e.action === errors_1.GossipAction.REJECT) {
                        const archivedPath = chain.persistInvalidSszObject("contributionAndProof", lodestar_types_1.ssz.altair.SignedContributionAndProof.serialize(contributionAndProof), (0, ssz_1.toHexString)(lodestar_types_1.ssz.altair.SignedContributionAndProof.hashTreeRoot(contributionAndProof)));
                        logger.debug("The submitted contribution adn proof was written to", archivedPath);
                    }
                }
            }));
            if (errors.length > 1) {
                throw Error("Multiple errors on publishContributionAndProofs\n" + errors.map((e) => e.message).join("\n"));
            }
            else if (errors.length === 1) {
                throw errors[0];
            }
        },
        async prepareBeaconCommitteeSubnet(subscriptions) {
            notWhileSyncing();
            network.prepareBeaconCommitteeSubnet(subscriptions.map(({ validatorIndex, slot, isAggregator, committeesAtSlot, committeeIndex }) => ({
                validatorIndex: validatorIndex,
                subnet: (0, utils_1.computeSubnetForCommitteesAtSlot)(slot, committeesAtSlot, committeeIndex),
                slot: slot,
                isAggregator: isAggregator,
            })));
            // TODO:
            // If the discovery mechanism isn't disabled, attempt to set up a peer discovery for the
            // required subnets.
            if (metrics) {
                for (const subscription of subscriptions) {
                    metrics.registerLocalValidator(subscription.validatorIndex);
                }
            }
        },
        /**
         * POST `/eth/v1/validator/sync_committee_subscriptions`
         *
         * Subscribe to a number of sync committee subnets.
         * Sync committees are not present in phase0, but are required for Altair networks.
         * Subscribing to sync committee subnets is an action performed by VC to enable network participation in Altair networks,
         * and only required if the VC has an active validator in an active sync committee.
         *
         * https://github.com/ethereum/eth2.0-APIs/pull/136
         */
        async prepareSyncCommitteeSubnets(subscriptions) {
            notWhileSyncing();
            // A `validatorIndex` can be in multiple subnets, so compute the CommitteeSubscription with double for loop
            const subs = [];
            for (const sub of subscriptions) {
                for (const committeeIndex of sub.syncCommitteeIndices) {
                    const subnet = Math.floor(committeeIndex / lodestar_params_1.SYNC_COMMITTEE_SUBNET_SIZE);
                    subs.push({
                        validatorIndex: sub.validatorIndex,
                        subnet: subnet,
                        // Subscribe until the end of `untilEpoch`: https://github.com/ethereum/eth2.0-APIs/pull/136#issuecomment-840315097
                        slot: (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(sub.untilEpoch + 1),
                        isAggregator: true,
                    });
                }
            }
            network.prepareSyncCommitteeSubnets(subs);
        },
    };
}
exports.getValidatorApi = getValidatorApi;
//# sourceMappingURL=index.js.map