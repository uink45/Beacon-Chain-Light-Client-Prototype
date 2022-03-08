"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeBeaconStateFromEth1 = exports.applyDeposits = exports.applyTimestamp = exports.applyEth1BlockHash = exports.getGenesisBeaconState = exports.isValidGenesisValidators = exports.isValidGenesisState = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const epoch_1 = require("./epoch");
const validator_1 = require("./validator");
const blockRoot_1 = require("./blockRoot");
const syncCommittee_1 = require("../util/syncCommittee");
const allForks_1 = require("../allForks");
const cachedBeaconState_1 = require("../cache/cachedBeaconState");
// TODO: Refactor to work with non-phase0 genesis state
/**
 * Check if it's valid genesis state.
 * @param config
 * @param state
 */
function isValidGenesisState(config, state) {
    return state.genesisTime >= config.MIN_GENESIS_TIME && isValidGenesisValidators(config, state);
}
exports.isValidGenesisState = isValidGenesisState;
/**
 * Check if it's valid genesis validators state.
 * @param config
 * @param state
 */
function isValidGenesisValidators(config, state) {
    return ((0, validator_1.getActiveValidatorIndices)(state, (0, epoch_1.computeEpochAtSlot)(lodestar_params_1.GENESIS_SLOT)).length >=
        config.MIN_GENESIS_ACTIVE_VALIDATOR_COUNT);
}
exports.isValidGenesisValidators = isValidGenesisValidators;
/**
 * Generate the initial beacon chain state.
 *
 * SLOW CODE - 🐢
 */
function getGenesisBeaconState(config, genesisEth1Data, latestBlockHeader) {
    // Seed RANDAO with Eth1 entropy
    const randaoMixes = Array(lodestar_params_1.EPOCHS_PER_HISTORICAL_VECTOR).fill(genesisEth1Data.blockHash);
    const state = config.getForkTypes(lodestar_params_1.GENESIS_SLOT).BeaconState.defaultTreeBacked();
    // MISC
    state.slot = lodestar_params_1.GENESIS_SLOT;
    const version = config.getForkVersion(lodestar_params_1.GENESIS_SLOT);
    const forkName = config.getForkName(lodestar_params_1.GENESIS_SLOT);
    const allForkNames = Object.keys(config.forks);
    const forkIndex = allForkNames.findIndex((item) => item === forkName);
    const previousForkIndex = Math.max(0, forkIndex - 1);
    const previousForkName = allForkNames[previousForkIndex];
    const previousFork = config.forks[previousForkName];
    // the altair genesis spec test requires previous version to be phase0 although ALTAIR_FORK_EPOCH=0
    state.fork = {
        previousVersion: previousFork.version,
        currentVersion: version,
        epoch: (0, epoch_1.computeEpochAtSlot)(lodestar_params_1.GENESIS_SLOT),
    };
    // Validator registry
    // Randomness and committees
    state.latestBlockHeader = latestBlockHeader;
    // Ethereum 1.0 chain data
    state.eth1Data = genesisEth1Data;
    state.randaoMixes = randaoMixes;
    // We need a CachedBeaconState to run processDeposit() which uses various caches.
    // However at this point the state's syncCommittees are not known.
    // This function can be called by:
    // - 1. genesis spec tests: Don't care about the committee cache
    // - 2. genesis builder: Only supports starting from genesis at phase0 fork
    // - 3. interop state: Only supports starting from genesis at phase0 fork
    // So it's okay to skip syncing the sync committee cache here and expect it to be
    // populated latter when the altair fork happens for cases 2, 3.
    return (0, cachedBeaconState_1.createCachedBeaconState)(config, state, { skipSyncCommitteeCache: true });
}
exports.getGenesisBeaconState = getGenesisBeaconState;
/**
 * Apply eth1 block hash to state.
 * @param config IChainForkConfig
 * @param state BeaconState
 * @param eth1BlockHash eth1 block hash
 */
function applyEth1BlockHash(state, eth1BlockHash) {
    state.eth1Data.blockHash = eth1BlockHash;
    state.randaoMixes = Array(lodestar_params_1.EPOCHS_PER_HISTORICAL_VECTOR).fill(eth1BlockHash);
}
exports.applyEth1BlockHash = applyEth1BlockHash;
/**
 * Apply eth1 block timestamp to state.
 * @param config IBeaconState
 * @param state BeaconState
 * @param eth1Timestamp eth1 block timestamp
 */
function applyTimestamp(config, state, eth1Timestamp) {
    state.genesisTime = eth1Timestamp + config.GENESIS_DELAY;
}
exports.applyTimestamp = applyTimestamp;
/**
 * Apply deposits to state.
 * For spec test, fullDepositDataRootList is undefined.
 * For genesis builder, fullDepositDataRootList is full list of deposit data root from index 0.
 *
 * SLOW CODE - 🐢
 *
 * @param config IChainForkConfig
 * @param state BeaconState
 * @param newDeposits new deposits
 * @param fullDepositDataRootList full list of deposit data root from index 0
 * @returns active validator indices
 */
function applyDeposits(config, state, newDeposits, fullDepositDataRootList) {
    const depositDataRootList = [];
    if (fullDepositDataRootList) {
        for (let index = 0; index < state.eth1Data.depositCount; index++) {
            depositDataRootList.push(fullDepositDataRootList[index]);
        }
    }
    const initDepositCount = depositDataRootList.length;
    const depositDatas = fullDepositDataRootList ? null : newDeposits.map((deposit) => deposit.data);
    const { DepositData, DepositDataRootList } = lodestar_types_1.ssz.phase0;
    for (const [index, deposit] of newDeposits.entries()) {
        if (fullDepositDataRootList) {
            depositDataRootList.push(fullDepositDataRootList[index + initDepositCount]);
            state.eth1Data.depositRoot = DepositDataRootList.hashTreeRoot(depositDataRootList);
        }
        else if (depositDatas) {
            const depositDataList = depositDatas.slice(0, index + 1);
            state.eth1Data.depositRoot = DepositDataRootList.hashTreeRoot(depositDataList.map((d) => DepositData.hashTreeRoot(d)));
        }
        state.eth1Data.depositCount += 1;
        const forkName = config.getForkName(lodestar_params_1.GENESIS_SLOT);
        (0, allForks_1.processDeposit)(forkName, state, deposit);
    }
    const activeValidatorIndices = [];
    // Process activations
    // validators are edited, so we're not iterating (read-only) through the validators
    const validatorLength = state.validators.length;
    for (let index = 0; index < validatorLength; index++) {
        const validator = state.validators[index];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const balance = state.balanceList.get(index);
        const effectiveBalance = Math.min(balance - (balance % lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT), lodestar_params_1.MAX_EFFECTIVE_BALANCE);
        validator.effectiveBalance = effectiveBalance;
        state.effectiveBalanceIncrementsSet(index, effectiveBalance);
        if (validator.effectiveBalance === lodestar_params_1.MAX_EFFECTIVE_BALANCE) {
            validator.activationEligibilityEpoch = lodestar_params_1.GENESIS_EPOCH;
            validator.activationEpoch = lodestar_params_1.GENESIS_EPOCH;
            activeValidatorIndices.push(index);
        }
        // If state is a CachedBeaconState<> validator has to be re-assigned manually
        state.validators[index] = validator;
    }
    // Set genesis validators root for domain separation and chain versioning
    state.genesisValidatorsRoot = config
        .getForkTypes(state.slot)
        .BeaconState.fields.validators.hashTreeRoot(state.validators);
    return activeValidatorIndices;
}
exports.applyDeposits = applyDeposits;
/**
 * Mainly used for spec test.
 *
 * SLOW CODE - 🐢
 *
 * @param config
 * @param eth1BlockHash
 * @param eth1Timestamp
 * @param deposits
 */
function initializeBeaconStateFromEth1(config, eth1BlockHash, eth1Timestamp, deposits, fullDepositDataRootList, executionPayloadHeader = lodestar_types_1.ssz.bellatrix.ExecutionPayloadHeader.defaultTreeBacked()) {
    const state = getGenesisBeaconState(
    // CachedBeaconcState is used for convinience only, we return TreeBacked<allForks.BeaconState> anyway
    // so it's safe to do a cast here, we can't use get domain until we have genesisValidatorRoot
    config, lodestar_types_1.ssz.phase0.Eth1Data.defaultValue(), (0, blockRoot_1.getTemporaryBlockHeader)(config, config.getForkTypes(lodestar_params_1.GENESIS_SLOT).BeaconBlock.defaultValue()));
    applyTimestamp(config, state, eth1Timestamp);
    applyEth1BlockHash(state, eth1BlockHash);
    // Process deposits
    const activeValidatorIndices = applyDeposits(config, state, deposits, fullDepositDataRootList);
    if (lodestar_params_1.GENESIS_SLOT >= config.ALTAIR_FORK_EPOCH) {
        const syncCommittees = (0, syncCommittee_1.getNextSyncCommittee)(state, activeValidatorIndices, state.effectiveBalanceIncrements);
        const stateAltair = state;
        stateAltair.fork.previousVersion = config.ALTAIR_FORK_VERSION;
        stateAltair.fork.currentVersion = config.ALTAIR_FORK_VERSION;
        stateAltair.currentSyncCommittee = syncCommittees;
        stateAltair.nextSyncCommittee = syncCommittees;
    }
    if (lodestar_params_1.GENESIS_SLOT >= config.BELLATRIX_FORK_EPOCH) {
        const stateBellatrix = state;
        stateBellatrix.fork.previousVersion = config.BELLATRIX_FORK_VERSION;
        stateBellatrix.fork.currentVersion = config.BELLATRIX_FORK_VERSION;
        stateBellatrix.latestExecutionPayloadHeader = executionPayloadHeader;
    }
    return state;
}
exports.initializeBeaconStateFromEth1 = initializeBeaconStateFromEth1;
//# sourceMappingURL=genesis.js.map