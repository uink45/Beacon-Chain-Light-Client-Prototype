"use strict";
/**
 * @module chain/genesis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenesisBuilder = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const stream_1 = require("../../eth1/stream");
class GenesisBuilder {
    constructor({ config, eth1Provider, logger, signal, pendingStatus, maxBlocksPerPoll }) {
        /** Is null if no block has been processed yet */
        this.lastProcessedBlockNumber = null;
        this.depositCache = new Set();
        this.logEvery = 30 * 1000;
        this.lastLog = 0;
        // at genesis builder, there is no genesis validator so we don't have a real IBeaconConfig
        // but we need IBeaconConfig to temporarily create CachedBeaconState, the cast here is safe since we don't use any getDomain here
        // the use of state as CachedBeaconState is just for convenient, IGenesisResult returns TreeBacked anyway
        this.config = config;
        this.eth1Provider = eth1Provider;
        this.logger = logger;
        this.signal = signal;
        this.eth1Params = {
            ...config,
            maxBlocksPerPoll: maxBlocksPerPoll !== null && maxBlocksPerPoll !== void 0 ? maxBlocksPerPoll : 10000,
        };
        if (pendingStatus) {
            this.logger.info("Restoring pending genesis state", { block: pendingStatus.lastProcessedBlockNumber });
            this.state = (0, lodestar_beacon_state_transition_1.createCachedBeaconState)(this.config, pendingStatus.state);
            this.depositTree = pendingStatus.depositTree;
            this.fromBlock = Math.max(pendingStatus.lastProcessedBlockNumber + 1, this.eth1Provider.deployBlock);
        }
        else {
            this.state = (0, lodestar_beacon_state_transition_1.getGenesisBeaconState)(this.config, lodestar_types_1.ssz.phase0.Eth1Data.defaultValue(), (0, lodestar_beacon_state_transition_1.getTemporaryBlockHeader)(this.config, config.getForkTypes(lodestar_params_1.GENESIS_SLOT).BeaconBlock.defaultValue()));
            this.depositTree = lodestar_types_1.ssz.phase0.DepositDataRootList.defaultTreeBacked();
            this.fromBlock = this.eth1Provider.deployBlock;
        }
    }
    /**
     * Get eth1 deposit events and blocks and apply to this.state until we found genesis.
     */
    async waitForGenesis() {
        await this.eth1Provider.validateContract();
        // Load data from data from this.db.depositData, this.db.depositDataRoot
        // And start from a more recent fromBlock
        const blockNumberValidatorGenesis = await this.waitForGenesisValidators();
        const depositsAndBlocksStream = (0, stream_1.getDepositsAndBlockStreamForGenesis)(blockNumberValidatorGenesis, this.eth1Provider, this.eth1Params, this.signal);
        for await (const [depositEvents, block] of depositsAndBlocksStream) {
            this.applyDeposits(depositEvents);
            (0, lodestar_beacon_state_transition_1.applyTimestamp)(this.config, this.state, block.timestamp);
            (0, lodestar_beacon_state_transition_1.applyEth1BlockHash)(this.state, block.blockHash);
            this.lastProcessedBlockNumber = block.blockNumber;
            if ((0, lodestar_beacon_state_transition_1.isValidGenesisState)(this.config, this.state)) {
                this.logger.info("Found genesis state", { blockNumber: block.blockNumber });
                return {
                    state: this.state,
                    depositTree: this.depositTree,
                    block,
                };
            }
            else {
                this.throttledLog(`Waiting for min genesis time ${block.timestamp} / ${this.config.MIN_GENESIS_TIME}`);
            }
        }
        throw Error("depositsStream stopped without a valid genesis state");
    }
    /**
     * First phase of waiting for genesis.
     * Stream deposits events in batches as big as possible without querying block data
     * @returns Block number at which there are enough active validators is state for genesis
     */
    async waitForGenesisValidators() {
        const depositsStream = (0, stream_1.getDepositsStream)(this.fromBlock, this.eth1Provider, this.eth1Params, this.signal);
        for await (const { depositEvents, blockNumber } of depositsStream) {
            this.applyDeposits(depositEvents);
            this.lastProcessedBlockNumber = blockNumber;
            if ((0, lodestar_beacon_state_transition_1.isValidGenesisValidators)(this.config, this.state)) {
                this.logger.info("Found enough genesis validators", { blockNumber });
                return blockNumber;
            }
            else {
                this.throttledLog(`Found ${this.state.validators.length} / ${this.config.MIN_GENESIS_ACTIVE_VALIDATOR_COUNT} validators to genesis`);
            }
        }
        throw Error("depositsStream stopped without a valid genesis state");
    }
    applyDeposits(depositEvents) {
        const newDeposits = depositEvents
            .filter((depositEvent) => !this.depositCache.has(depositEvent.index))
            .map((depositEvent) => {
            this.depositCache.add(depositEvent.index);
            this.depositTree.push(lodestar_types_1.ssz.phase0.DepositData.hashTreeRoot(depositEvent.depositData));
            return {
                proof: this.depositTree.tree.getSingleProof(this.depositTree.type.getPropertyGindex(depositEvent.index)),
                data: depositEvent.depositData,
            };
        });
        (0, lodestar_beacon_state_transition_1.applyDeposits)(this.config, this.state, newDeposits, this.depositTree);
        // TODO: If necessary persist deposits here to this.db.depositData, this.db.depositDataRoot
    }
    /** Throttle genesis generation status log to prevent spamming */
    throttledLog(message) {
        if (Date.now() - this.lastLog > this.logEvery) {
            this.lastLog = Date.now();
            this.logger.info(message);
        }
    }
}
exports.GenesisBuilder = GenesisBuilder;
//# sourceMappingURL=genesis.js.map