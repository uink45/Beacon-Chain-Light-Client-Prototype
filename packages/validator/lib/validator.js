"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const abort_controller_1 = require("@chainsafe/abort-controller");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_config_1 = require("@chainsafe/lodestar-config");
const lodestar_api_1 = require("@chainsafe/lodestar-api");
const clock_1 = require("./util/clock");
const genesis_1 = require("./genesis");
const block_1 = require("./services/block");
const attestation_1 = require("./services/attestation");
const indices_1 = require("./services/indices");
const syncCommittee_1 = require("./services/syncCommittee");
const util_1 = require("./util");
const chainHeaderTracker_1 = require("./services/chainHeaderTracker");
const _1 = require(".");
const ssz_1 = require("@chainsafe/ssz");
const emitter_1 = require("./services/emitter");
const validatorStore_1 = require("./services/validatorStore");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
// TODO: Extend the timeout, and let it be customizable
/// The global timeout for HTTP requests to the beacon node.
// const HTTP_TIMEOUT_MS = 12 * 1000;
var Status;
(function (Status) {
    Status[Status["running"] = 0] = "running";
    Status[Status["stopped"] = 1] = "stopped";
})(Status || (Status = {}));
/**
 * Main class for the Validator client.
 */
class Validator {
    constructor(opts, genesis) {
        this.state = { status: Status.stopped };
        /** Provide the current AbortSignal to the api instance */
        this.getAbortSignal = () => {
            return this.state.status === Status.running ? this.state.controller.signal : undefined;
        };
        const { dbOps, logger, slashingProtection, signers, graffiti } = opts;
        const config = (0, lodestar_config_1.createIBeaconConfig)(dbOps.config, genesis.genesisValidatorsRoot);
        const api = typeof opts.api === "string"
            ? (0, lodestar_api_1.getClient)(config, {
                baseUrl: opts.api,
                // Validator would need the beacon to respond within the slot
                timeoutMs: config.SECONDS_PER_SLOT * 1000,
                getAbortSignal: this.getAbortSignal,
            })
            : opts.api;
        const clock = new clock_1.Clock(config, logger, { genesisTime: Number(genesis.genesisTime) });
        const validatorStore = new validatorStore_1.ValidatorStore(config, slashingProtection, signers, genesis);
        const indicesService = new indices_1.IndicesService(logger, api, validatorStore);
        this.emitter = new emitter_1.ValidatorEventEmitter();
        this.chainHeaderTracker = new chainHeaderTracker_1.ChainHeaderTracker(logger, api, this.emitter);
        const loggerVc = (0, util_1.getLoggerVc)(logger, clock);
        new block_1.BlockProposingService(config, loggerVc, api, clock, validatorStore, graffiti);
        new attestation_1.AttestationService(loggerVc, api, clock, validatorStore, this.emitter, indicesService, this.chainHeaderTracker);
        new syncCommittee_1.SyncCommitteeService(config, loggerVc, api, clock, validatorStore, this.chainHeaderTracker, indicesService);
        this.config = config;
        this.logger = logger;
        this.api = api;
        this.clock = clock;
        this.validatorStore = validatorStore;
    }
    /** Waits for genesis and genesis time */
    static async initializeFromBeaconNode(opts, signal) {
        const { config } = opts.dbOps;
        const api = typeof opts.api === "string"
            ? // This new api instance can make do with default timeout as a faster timeout is
                // not necessary since this instance won't be used for validator duties
                (0, lodestar_api_1.getClient)(config, { baseUrl: opts.api, getAbortSignal: () => signal })
            : opts.api;
        const genesis = await (0, genesis_1.waitForGenesis)(api, opts.logger, signal);
        opts.logger.info("Genesis available");
        const { data: externalSpecJson } = await api.config.getSpec();
        (0, util_1.assertEqualParams)(config, externalSpecJson);
        opts.logger.info("Verified node and validator have same config");
        await assertEqualGenesis(opts, genesis);
        opts.logger.info("Verified node and validator have same genesisValidatorRoot");
        return new Validator(opts, genesis);
    }
    /**
     * Instantiates block and attestation services and runs them once the chain has been started.
     */
    async start() {
        if (this.state.status === Status.running)
            return;
        const controller = new abort_controller_1.AbortController();
        this.state = { status: Status.running, controller };
        const { signal } = controller;
        this.clock.start(signal);
        this.chainHeaderTracker.start(signal);
    }
    /**
     * Stops all validator functions.
     */
    async stop() {
        if (this.state.status === Status.stopped)
            return;
        this.state.controller.abort();
        this.state = { status: Status.stopped };
    }
    /**
     * Perform a voluntary exit for the given validator by its key.
     */
    async voluntaryExit(publicKey, exitEpoch) {
        const { data: stateValidators } = await this.api.beacon.getStateValidators("head", { indices: [publicKey] });
        const stateValidator = stateValidators[0];
        if (stateValidator === undefined) {
            throw new Error(`Validator pubkey ${publicKey} not found in state`);
        }
        if (exitEpoch === undefined) {
            const currentSlot = (0, lodestar_beacon_state_transition_1.getCurrentSlot)(this.config, this.clock.genesisTime);
            exitEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(currentSlot);
        }
        const signedVoluntaryExit = await this.validatorStore.signVoluntaryExit(publicKey, stateValidator.index, exitEpoch);
        await this.api.beacon.submitPoolVoluntaryExit(signedVoluntaryExit);
        this.logger.info(`Submitted voluntary exit for ${publicKey} to the network`);
    }
}
exports.Validator = Validator;
/** Assert the same genesisValidatorRoot and genesisTime */
async function assertEqualGenesis(opts, genesis) {
    const nodeGenesisValidatorRoot = genesis.genesisValidatorsRoot;
    const metaDataRepository = new _1.MetaDataRepository(opts.dbOps);
    const genesisValidatorsRoot = await metaDataRepository.getGenesisValidatorsRoot();
    if (genesisValidatorsRoot) {
        if (!lodestar_types_1.ssz.Root.equals(genesisValidatorsRoot, nodeGenesisValidatorRoot)) {
            // this happens when the existing validator db served another network before
            opts.logger.error("Not the same genesisValidatorRoot", {
                expected: (0, ssz_1.toHexString)(nodeGenesisValidatorRoot),
                actual: (0, ssz_1.toHexString)(genesisValidatorsRoot),
            });
            throw new util_1.NotEqualParamsError("Not the same genesisValidatorRoot");
        }
    }
    else {
        await metaDataRepository.setGenesisValidatorsRoot(nodeGenesisValidatorRoot);
        opts.logger.info("Persisted genesisValidatorRoot", (0, ssz_1.toHexString)(nodeGenesisValidatorRoot));
    }
    const nodeGenesisTime = genesis.genesisTime;
    const genesisTime = await metaDataRepository.getGenesisTime();
    if (genesisTime !== null) {
        if (genesisTime !== nodeGenesisTime) {
            opts.logger.error("Not the same genesisTime", { expected: nodeGenesisTime, actual: genesisTime });
            throw new util_1.NotEqualParamsError("Not the same genesisTime");
        }
    }
    else {
        await metaDataRepository.setGenesisTime(nodeGenesisTime);
        opts.logger.info("Persisted genesisTime", nodeGenesisTime);
    }
}
//# sourceMappingURL=validator.js.map