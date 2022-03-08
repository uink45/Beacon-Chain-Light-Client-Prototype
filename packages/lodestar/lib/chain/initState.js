"use strict";
/**
 * @module chain
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAnchorCheckpoint = exports.initBeaconMetrics = exports.restoreStateCaches = exports.initStateFromAnchorState = exports.initStateFromDb = exports.initStateFromEth1 = exports.createGenesisBlock = exports.persistAnchorState = exports.persistGenesisResult = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const constants_1 = require("../constants");
const eth1_1 = require("../eth1");
const genesis_1 = require("./genesis/genesis");
async function persistGenesisResult(db, genesisResult, genesisBlock) {
    await Promise.all([
        db.stateArchive.add(genesisResult.state),
        db.blockArchive.add(genesisBlock),
        db.depositDataRoot.putList(genesisResult.depositTree),
        db.eth1Data.put(genesisResult.block.timestamp, {
            ...genesisResult.block,
            depositCount: genesisResult.depositTree.length,
            depositRoot: genesisResult.depositTree.hashTreeRoot(),
        }),
    ]);
}
exports.persistGenesisResult = persistGenesisResult;
async function persistAnchorState(config, db, anchorState) {
    if (anchorState.slot === constants_1.GENESIS_SLOT) {
        const genesisBlock = createGenesisBlock(config, anchorState);
        await Promise.all([
            db.blockArchive.add(genesisBlock),
            db.block.add(genesisBlock),
            db.stateArchive.add(anchorState),
        ]);
    }
    else {
        await db.stateArchive.add(anchorState);
    }
}
exports.persistAnchorState = persistAnchorState;
function createGenesisBlock(config, genesisState) {
    const types = config.getForkTypes(constants_1.GENESIS_SLOT);
    const genesisBlock = types.SignedBeaconBlock.defaultValue();
    const stateRoot = types.BeaconState.hashTreeRoot(genesisState);
    genesisBlock.message.stateRoot = stateRoot;
    return genesisBlock;
}
exports.createGenesisBlock = createGenesisBlock;
/**
 * Initialize and persist a genesis state and related data
 */
async function initStateFromEth1({ config, db, logger, opts, signal, }) {
    logger.info("Listening to eth1 for genesis state");
    const statePreGenesis = await db.preGenesisState.get();
    const depositTree = await db.depositDataRoot.getDepositRootTree();
    const lastProcessedBlockNumber = await db.preGenesisStateLastProcessedBlock.get();
    const builder = new genesis_1.GenesisBuilder({
        config,
        eth1Provider: new eth1_1.Eth1Provider(config, opts, signal),
        logger,
        signal,
        pendingStatus: statePreGenesis && depositTree !== undefined && lastProcessedBlockNumber != null
            ? { state: statePreGenesis, depositTree, lastProcessedBlockNumber }
            : undefined,
    });
    try {
        const genesisResult = await builder.waitForGenesis();
        const genesisBlock = createGenesisBlock(config, genesisResult.state);
        const types = config.getForkTypes(constants_1.GENESIS_SLOT);
        const stateRoot = types.BeaconState.hashTreeRoot(genesisResult.state);
        const blockRoot = types.BeaconBlock.hashTreeRoot(genesisBlock.message);
        logger.info("Initializing genesis state", {
            stateRoot: (0, ssz_1.toHexString)(stateRoot),
            blockRoot: (0, ssz_1.toHexString)(blockRoot),
            validatorCount: genesisResult.state.validators.length,
        });
        await persistGenesisResult(db, genesisResult, genesisBlock);
        logger.verbose("Clearing pending genesis state if any");
        await db.preGenesisState.delete();
        await db.preGenesisStateLastProcessedBlock.delete();
        return genesisResult.state;
    }
    catch (e) {
        if (builder.lastProcessedBlockNumber != null) {
            logger.info("Persisting genesis state", { block: builder.lastProcessedBlockNumber });
            await db.preGenesisState.put(builder.state);
            await db.depositDataRoot.putList(builder.depositTree);
            await db.preGenesisStateLastProcessedBlock.put(builder.lastProcessedBlockNumber);
        }
        throw e;
    }
}
exports.initStateFromEth1 = initStateFromEth1;
/**
 * Restore the latest beacon state from db
 */
async function initStateFromDb(config, db, logger) {
    const state = await db.stateArchive.lastValue();
    if (!state) {
        throw new Error("No state exists in database");
    }
    logger.info("Initializing beacon state from db", {
        slot: state.slot,
        epoch: (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(state.slot),
        stateRoot: (0, ssz_1.toHexString)(config.getForkTypes(state.slot).BeaconState.hashTreeRoot(state)),
    });
    return state;
}
exports.initStateFromDb = initStateFromDb;
/**
 * Initialize and persist an anchor state (either weak subjectivity or genesis)
 */
async function initStateFromAnchorState(config, db, logger, anchorState) {
    logger.info("Initializing beacon state from anchor state", {
        slot: anchorState.slot,
        epoch: (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(anchorState.slot),
        stateRoot: (0, ssz_1.toHexString)(config.getForkTypes(anchorState.slot).BeaconState.hashTreeRoot(anchorState)),
    });
    await persistAnchorState(config, db, anchorState);
    return anchorState;
}
exports.initStateFromAnchorState = initStateFromAnchorState;
/**
 * Restore a beacon state to the state cache.
 */
function restoreStateCaches(config, stateCache, checkpointStateCache, state) {
    const { checkpoint } = computeAnchorCheckpoint(config, state);
    const cachedBeaconState = (0, lodestar_beacon_state_transition_1.createCachedBeaconState)(config, state);
    // store state in state caches
    void stateCache.add(cachedBeaconState);
    checkpointStateCache.add(checkpoint, cachedBeaconState);
    return cachedBeaconState;
}
exports.restoreStateCaches = restoreStateCaches;
function initBeaconMetrics(metrics, state) {
    metrics.headSlot.set(state.slot);
    metrics.previousJustifiedEpoch.set(state.previousJustifiedCheckpoint.epoch);
    metrics.currentJustifiedEpoch.set(state.currentJustifiedCheckpoint.epoch);
    metrics.finalizedEpoch.set(state.finalizedCheckpoint.epoch);
}
exports.initBeaconMetrics = initBeaconMetrics;
function computeAnchorCheckpoint(config, anchorState) {
    let blockHeader;
    let root;
    const blockTypes = config.getForkTypes(anchorState.latestBlockHeader.slot);
    const stateTypes = config.getForkTypes(anchorState.slot);
    if (anchorState.latestBlockHeader.slot === constants_1.GENESIS_SLOT) {
        const block = blockTypes.BeaconBlock.defaultValue();
        block.stateRoot = stateTypes.BeaconState.hashTreeRoot(anchorState);
        blockHeader = (0, lodestar_beacon_state_transition_1.blockToHeader)(config, block);
        root = lodestar_types_1.ssz.phase0.BeaconBlockHeader.hashTreeRoot(blockHeader);
    }
    else {
        blockHeader = lodestar_types_1.ssz.phase0.BeaconBlockHeader.clone(anchorState.latestBlockHeader);
        if (lodestar_types_1.ssz.Root.equals(blockHeader.stateRoot, constants_1.ZERO_HASH)) {
            blockHeader.stateRoot = stateTypes.BeaconState.hashTreeRoot(anchorState);
        }
        root = lodestar_types_1.ssz.phase0.BeaconBlockHeader.hashTreeRoot(blockHeader);
    }
    return {
        checkpoint: {
            root,
            // the checkpoint epoch = computeEpochAtSlot(anchorState.slot) + 1 if slot is not at epoch boundary
            // this is similar to a process_slots() call
            epoch: Math.ceil(anchorState.slot / lodestar_params_1.SLOTS_PER_EPOCH),
        },
        blockHeader,
    };
}
exports.computeAnchorCheckpoint = computeAnchorCheckpoint;
//# sourceMappingURL=initState.js.map