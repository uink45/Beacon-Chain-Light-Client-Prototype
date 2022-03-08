"use strict";
/**
 * @module chain
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeaconChain = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const ssz_1 = require("@chainsafe/ssz");
const abort_controller_1 = require("@chainsafe/abort-controller");
const constants_1 = require("../constants");
const stateCache_1 = require("./stateCache");
const blocks_1 = require("./blocks");
const clock_1 = require("./clock");
const emitter_1 = require("./emitter");
const eventHandlers_1 = require("./eventHandlers");
const regen_1 = require("./regen");
const forkChoice_1 = require("./forkChoice");
const initState_1 = require("./initState");
const bls_1 = require("./bls");
const seenCache_1 = require("./seenCache");
const opPools_1 = require("./opPools");
const lightClient_1 = require("./lightClient");
const archiver_1 = require("./archiver");
const precomputeNextEpochTransition_1 = require("./precomputeNextEpochTransition");
const reprocess_1 = require("./reprocess");
class BeaconChain {
    constructor(opts, { config, db, logger, metrics, anchorState, eth1, executionEngine, }) {
        // Ops pool
        this.attestationPool = new opPools_1.AttestationPool();
        this.aggregatedAttestationPool = new opPools_1.AggregatedAttestationPool();
        this.syncCommitteeMessagePool = new opPools_1.SyncCommitteeMessagePool();
        this.syncContributionAndProofPool = new opPools_1.SyncContributionAndProofPool();
        this.opPool = new opPools_1.OpPool();
        // Gossip seen cache
        this.seenAttesters = new seenCache_1.SeenAttesters();
        this.seenAggregators = new seenCache_1.SeenAggregators();
        this.seenBlockProposers = new seenCache_1.SeenBlockProposers();
        this.seenSyncCommitteeMessages = new seenCache_1.SeenSyncCommitteeMessages();
        this.seenContributionAndProof = new seenCache_1.SeenContributionAndProof();
        this.abortController = new abort_controller_1.AbortController();
        this.opts = opts;
        this.config = config;
        this.db = db;
        this.logger = logger;
        this.metrics = metrics;
        this.genesisTime = anchorState.genesisTime;
        this.anchorStateLatestBlockSlot = anchorState.latestBlockHeader.slot;
        this.genesisValidatorsRoot = anchorState.genesisValidatorsRoot.valueOf();
        this.eth1 = eth1;
        this.executionEngine = executionEngine;
        const signal = this.abortController.signal;
        const emitter = new emitter_1.ChainEventEmitter();
        // by default, verify signatures on both main threads and worker threads
        const bls = opts.blsVerifyAllMainThread
            ? new bls_1.BlsSingleThreadVerifier({ metrics })
            : new bls_1.BlsMultiThreadWorkerPool(opts, { logger, metrics, signal: this.abortController.signal });
        const clock = new clock_1.LocalClock({ config, emitter, genesisTime: this.genesisTime, signal });
        const stateCache = new stateCache_1.StateContextCache({ metrics });
        const checkpointStateCache = new stateCache_1.CheckpointStateCache({ metrics });
        const cachedState = (0, initState_1.restoreStateCaches)(config, stateCache, checkpointStateCache, anchorState);
        const forkChoice = (0, forkChoice_1.initializeForkChoice)(config, emitter, clock.currentSlot, cachedState, opts.proposerBoostEnabled, metrics);
        const regen = new regen_1.QueuedStateRegenerator({
            config,
            forkChoice,
            stateCache,
            checkpointStateCache,
            db,
            metrics,
            emitter,
            signal,
        });
        const lightClientServer = new lightClient_1.LightClientServer({ config, db, metrics, emitter, logger });
        this.reprocessController = new reprocess_1.ReprocessController(this.metrics);
        this.blockProcessor = new blocks_1.BlockProcessor({
            clock,
            bls,
            regen,
            executionEngine,
            eth1,
            db,
            forkChoice,
            lightClientServer,
            stateCache,
            checkpointStateCache,
            emitter,
            config,
            logger,
            metrics,
        }, opts, signal);
        this.forkChoice = forkChoice;
        this.clock = clock;
        this.regen = regen;
        this.bls = bls;
        this.checkpointStateCache = checkpointStateCache;
        this.stateCache = stateCache;
        this.emitter = emitter;
        this.lightClientServer = lightClientServer;
        this.archiver = new archiver_1.Archiver(db, this, logger, signal);
        new precomputeNextEpochTransition_1.PrecomputeNextEpochTransitionScheduler(this, this.config, metrics, this.logger, signal);
        eventHandlers_1.handleChainEvents.bind(this)(this.abortController.signal);
    }
    close() {
        this.abortController.abort();
        this.stateCache.clear();
        this.checkpointStateCache.clear();
    }
    /** Populate in-memory caches with persisted data. Call at least once on startup */
    async loadFromDisk() {
        await this.opPool.fromPersisted(this.db);
    }
    /** Persist in-memory data to the DB. Call at least once before stopping the process */
    async persistToDisk() {
        await this.archiver.persistToDisk();
        await this.opPool.toPersisted(this.db);
    }
    getGenesisTime() {
        return this.genesisTime;
    }
    getHeadState() {
        // head state should always exist
        const head = this.forkChoice.getHead();
        const headState = this.checkpointStateCache.getLatest(head.blockRoot, Infinity) || this.stateCache.get(head.stateRoot);
        if (!headState)
            throw Error("headState does not exist");
        return headState;
    }
    async getHeadStateAtCurrentEpoch() {
        const currentEpochStartSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(this.clock.currentEpoch);
        const head = this.forkChoice.getHead();
        const bestSlot = currentEpochStartSlot > head.slot ? currentEpochStartSlot : head.slot;
        return await this.regen.getBlockSlotState(head.blockRoot, bestSlot, regen_1.RegenCaller.getDuties);
    }
    async getCanonicalBlockAtSlot(slot) {
        const finalizedBlock = this.forkChoice.getFinalizedBlock();
        if (finalizedBlock.slot > slot) {
            return this.db.blockArchive.get(slot);
        }
        const block = this.forkChoice.getCanonicalBlockAtSlot(slot);
        if (!block) {
            return null;
        }
        return await this.db.block.get((0, ssz_1.fromHexString)(block.blockRoot));
    }
    async processBlock(block, flags) {
        return await this.blockProcessor.processBlockJob({ ...flags, block });
    }
    async processChainSegment(blocks, flags) {
        return await this.blockProcessor.processChainSegment(blocks.map((block) => ({ ...flags, block })));
    }
    getStatus() {
        const head = this.forkChoice.getHead();
        const finalizedCheckpoint = this.forkChoice.getFinalizedCheckpoint();
        return {
            // fork_digest: The node's ForkDigest (compute_fork_digest(current_fork_version, genesis_validators_root)) where
            // - current_fork_version is the fork version at the node's current epoch defined by the wall-clock time (not necessarily the epoch to which the node is sync)
            // - genesis_validators_root is the static Root found in state.genesis_validators_root
            forkDigest: this.config.forkName2ForkDigest(this.config.getForkName(this.clock.currentSlot)),
            // finalized_root: state.finalized_checkpoint.root for the state corresponding to the head block (Note this defaults to Root(b'\x00' * 32) for the genesis finalized checkpoint).
            finalizedRoot: finalizedCheckpoint.epoch === constants_1.GENESIS_EPOCH ? constants_1.ZERO_HASH : finalizedCheckpoint.root,
            finalizedEpoch: finalizedCheckpoint.epoch,
            // TODO: PERFORMANCE: Memoize to prevent re-computing every time
            headRoot: (0, ssz_1.fromHexString)(head.blockRoot),
            headSlot: head.slot,
        };
    }
    /**
     * Returns Promise that resolves either on block found or once 1 slot passes.
     * Used to handle unknown block root for both unaggregated and aggregated attestations.
     * @returns true if blockFound
     */
    waitForBlockOfAttestation(slot, root) {
        return this.reprocessController.waitForBlockOfAttestation(slot, root);
    }
    persistInvalidSszObject(type, bytes, suffix = "") {
        const now = new Date();
        // yyyy-MM-dd
        const date = now.toISOString().split("T")[0];
        // by default store to lodestar_archive of current dir
        const byDate = this.opts.persistInvalidSszObjectsDir
            ? `${this.opts.persistInvalidSszObjectsDir}/${date}`
            : `invalidSszObjects/${date}`;
        if (!node_fs_1.default.existsSync(byDate)) {
            node_fs_1.default.mkdirSync(byDate, { recursive: true });
        }
        const fileName = `${byDate}/${type}_${suffix}.ssz`;
        // as of Feb 17 2022 there are a lot of duplicate files stored with different date suffixes
        // remove date suffixes in file name, and check duplicate to avoid redundant persistence
        if (!node_fs_1.default.existsSync(fileName)) {
            node_fs_1.default.writeFileSync(fileName, bytes);
        }
        return fileName;
    }
}
exports.BeaconChain = BeaconChain;
//# sourceMappingURL=chain.js.map