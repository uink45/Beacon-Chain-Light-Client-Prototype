"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBeaconState = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_config_1 = require("@chainsafe/lodestar-config");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_1 = require("@chainsafe/lodestar");
// eslint-disable-next-line no-restricted-imports
const multifork_1 = require("@chainsafe/lodestar/lib/util/multifork");
const util_1 = require("../../util");
const globalOptions_1 = require("../../options/globalOptions");
const wssOptions_1 = require("../../options/wssOptions");
const networks_1 = require("../../networks");
function getCheckpointFromState(config, state) {
    return {
        epoch: (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(state.latestBlockHeader.slot),
        root: (0, lodestar_beacon_state_transition_1.getLatestBlockRoot)(config, state),
    };
}
async function initAndVerifyWeakSubjectivityState(config, db, logger, store, wsState, wsCheckpoint) {
    // Check if the store's state and wsState are compatible
    if (store.genesisTime !== wsState.genesisTime ||
        !lodestar_types_1.ssz.Root.equals(store.genesisValidatorsRoot, wsState.genesisValidatorsRoot)) {
        throw new Error("Db state and checkpoint state are not compatible, either clear the db or verify your checkpoint source");
    }
    // Pick the state which is ahead as an anchor to initialize the beacon chain
    let anchorState = wsState;
    let anchorCheckpoint = wsCheckpoint;
    if (store.slot > wsState.slot) {
        anchorState = store;
        anchorCheckpoint = getCheckpointFromState(config, store);
        logger.verbose("Db state is ahead of the provided checkpoint state, using the db state to initialize the beacon chain");
    }
    if (!(0, lodestar_beacon_state_transition_1.isWithinWeakSubjectivityPeriod)(config, anchorState, anchorCheckpoint)) {
        throw new Error("Fetched weak subjectivity checkpoint not within weak subjectivity period.");
    }
    anchorState = await (0, lodestar_1.initStateFromAnchorState)(config, db, logger, anchorState);
    // Return the latest anchorState but still return original wsCheckpoint to validate in backfill
    return { anchorState, wsCheckpoint };
}
/**
 * Initialize a beacon state, picking the strategy based on the `IBeaconArgs`
 *
 * State is initialized in one of three ways:
 * 1. restore from weak subjectivity state (possibly downloaded from a remote beacon node)
 * 2. restore from db
 * 3. restore from genesis state (possibly downloaded via URL)
 * 4. create genesis state from eth1
 */
async function initBeaconState(options, args, chainForkConfig, db, logger, signal) {
    // fetch the latest state stored in the db
    // this will be used in all cases, if it exists, either used during verification of a weak subjectivity state, or used directly as the anchor state
    const lastDbState = await db.stateArchive.lastValue();
    const wssOpts = (0, wssOptions_1.parseWSSArgs)(args);
    if (wssOpts) {
        return await initFromWSState(lastDbState, wssOpts, chainForkConfig, db, logger);
    }
    else if (lastDbState) {
        // start the chain from the latest stored state in the db
        const config = (0, lodestar_config_1.createIBeaconConfig)(chainForkConfig, lastDbState.genesisValidatorsRoot);
        const anchorState = await (0, lodestar_1.initStateFromAnchorState)(config, db, logger, lastDbState);
        return { anchorState };
    }
    else {
        const genesisStateFile = args.genesisStateFile || (0, networks_1.getGenesisFileUrl)(args.network || globalOptions_1.defaultNetwork);
        if (genesisStateFile && !args.forceGenesis) {
            const stateBytes = await (0, util_1.downloadOrLoadFile)(genesisStateFile);
            let anchorState = (0, multifork_1.getStateTypeFromBytes)(chainForkConfig, stateBytes).createTreeBackedFromBytes(stateBytes);
            const config = (0, lodestar_config_1.createIBeaconConfig)(chainForkConfig, anchorState.genesisValidatorsRoot);
            anchorState = await (0, lodestar_1.initStateFromAnchorState)(config, db, logger, anchorState);
            return { anchorState };
        }
        else {
            const anchorState = await (0, lodestar_1.initStateFromEth1)({ config: chainForkConfig, db, logger, opts: options.eth1, signal });
            return { anchorState };
        }
    }
}
exports.initBeaconState = initBeaconState;
async function initFromWSState(lastDbState, wssOpts, chainForkConfig, db, logger) {
    if (wssOpts.weakSubjectivityStateFile) {
        // weak subjectivity sync from a provided state file:
        // if a weak subjectivity checkpoint has been provided, it is used for additional verification
        // otherwise, the state itself is used for verification (not bad, because the trusted state has been explicitly provided)
        const { weakSubjectivityStateFile, weakSubjectivityCheckpoint } = wssOpts;
        const stateBytes = await (0, util_1.downloadOrLoadFile)(weakSubjectivityStateFile);
        const wsState = (0, multifork_1.getStateTypeFromBytes)(chainForkConfig, stateBytes).createTreeBackedFromBytes(stateBytes);
        const config = (0, lodestar_config_1.createIBeaconConfig)(chainForkConfig, wsState.genesisValidatorsRoot);
        const store = lastDbState !== null && lastDbState !== void 0 ? lastDbState : wsState;
        const checkpoint = weakSubjectivityCheckpoint
            ? (0, networks_1.getCheckpointFromArg)(weakSubjectivityCheckpoint)
            : getCheckpointFromState(config, wsState);
        return initAndVerifyWeakSubjectivityState(config, db, logger, store, wsState, checkpoint);
    }
    else if (wssOpts.weakSubjectivitySyncLatest) {
        // weak subjectivity sync from a state that needs to be fetched:
        // if a weak subjectivity checkpoint has been provided, it is used to inform which state to download and used for additional verification
        // otherwise, the 'finalized' state is downloaded and the state itself is used for verification (all trust delegated to the remote beacon node)
        const { weakSubjectivityServerUrl } = wssOpts;
        try {
            // Validate the weakSubjectivityServerUrl and only log the origin to mask the
            // username password credentials
            const wssUrl = new URL(weakSubjectivityServerUrl);
            logger.info("Fetching weak subjectivity state", {
                weakSubjectivityServerUrl: wssUrl.origin,
            });
        }
        catch (e) {
            logger.error("Invalid", { weakSubjectivityServerUrl }, e);
            throw e;
        }
        const { wsState, wsCheckpoint } = await (0, networks_1.fetchWeakSubjectivityState)(chainForkConfig, wssOpts);
        const config = (0, lodestar_config_1.createIBeaconConfig)(chainForkConfig, wsState.genesisValidatorsRoot);
        const store = lastDbState !== null && lastDbState !== void 0 ? lastDbState : wsState;
        return initAndVerifyWeakSubjectivityState(config, db, logger, store, wsState, wsCheckpoint);
    }
    else {
        throw Error("Invalid wss options");
    }
}
//# sourceMappingURL=initBeaconState.js.map