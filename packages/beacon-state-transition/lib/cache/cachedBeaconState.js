"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedBeaconStateProxyHandler = exports.BeaconStateContext = exports.createCachedBeaconState = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_config_1 = require("@chainsafe/lodestar-config");
const persistent_ts_1 = require("@chainsafe/persistent-ts");
const epochContext_1 = require("./epochContext");
const balanceList_1 = require("./balanceList");
const cachedEpochParticipation_1 = require("./cachedEpochParticipation");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const cachedInactivityScoreList_1 = require("./cachedInactivityScoreList");
const array_1 = require("../util/array");
function createCachedBeaconState(chainForkConfig, state, opts) {
    const config = (0, lodestar_config_1.createIBeaconConfig)(chainForkConfig, state.genesisValidatorsRoot);
    let cachedPreviousParticipation, cachedCurrentParticipation;
    const forkName = config.getForkName(state.slot);
    const epochCtx = epochContext_1.EpochContext.createFromState(config, state, opts);
    let cachedInactivityScores;
    if (forkName === lodestar_params_1.ForkName.phase0) {
        // TODO: More efficient way of getting the length?
        const validatorCount = state.validators.length;
        // Can these arrays be zero-ed for phase0? Are they actually used?
        cachedPreviousParticipation = persistent_ts_1.MutableVector.from((0, array_1.newFilledArray)(validatorCount, 0));
        cachedCurrentParticipation = persistent_ts_1.MutableVector.from((0, array_1.newFilledArray)(validatorCount, 0));
        cachedInactivityScores = persistent_ts_1.MutableVector.empty();
    }
    else {
        const altairState = state;
        cachedPreviousParticipation = persistent_ts_1.MutableVector.from(Array.from((0, ssz_1.readonlyValues)(altairState.previousEpochParticipation)));
        cachedCurrentParticipation = persistent_ts_1.MutableVector.from(Array.from((0, ssz_1.readonlyValues)(altairState.currentEpochParticipation)));
        cachedInactivityScores = persistent_ts_1.MutableVector.from((0, ssz_1.readonlyValues)(altairState.inactivityScores));
    }
    return new Proxy(new BeaconStateContext(state.type, state.tree, cachedPreviousParticipation, cachedCurrentParticipation, cachedInactivityScores, epochCtx), exports.CachedBeaconStateProxyHandler);
}
exports.createCachedBeaconState = createCachedBeaconState;
/**
 * Cache useful data associated to a specific state.
 * Optimize processing speed of block processing + gossip validation while having a low memory cost.
 *
 * Previously BeaconStateContext included:
 * ```ts
 * validators: CachedValidatorList & T["validators"];
 * balances: CachedBalanceList & T["balances"];
 * inactivityScores: CachedInactivityScoreList & List<Number64>;
 * ```
 *
 * Those caches where removed since they are no strictly necessary to make the epoch transition faster,
 * but have a high memory cost. Note that all data was duplicated between the Tree and MutableVector.
 * 1. TreeBacked, for efficient hashing
 * 2. MutableVector (persistent-ts) with StructBacked validator objects for fast accessing and iteration
 *
 * ### validators
 * state.validators is the heaviest data structure in the state. As TreeBacked, the leafs account for 91% with
 * 200_000 validators. It requires ~ 2_000_000 Uint8Array instances with total memory of ~ 400MB.
 * However its contents don't change very often. Validators only change when;
 * - they first deposit
 * - they dip from 32 effective balance to 31 (pretty much only when inactive for very long, or slashed)
 * - they activate (once)
 * - they exit (once)
 * - they get slashed (max once)
 *
 * ### balances
 * The balances array completely changes at the epoch boundary, where almost all the validator balances
 * are updated. However it may have tiny changes during block processing if:
 * - On a valid deposit
 * - Validator gets slashed
 * - On altair, the block proposer. Optimized to only happen once per block
 *
 * ### inactivityScores
 * inactivityScores can be changed only:
 * - At the epoch transition. It only changes when a validator is offline. So it may change a bit but not
 *   a lot on normal network conditions.
 * - During block processing, when a validator joins a new 0 entry is pushed
 *
 * RESULT: Don't keep a duplicated structure around always. During block processing just push to the tree. During
 * epoch processing some temporary flat structures are computed but dropped after processing the epoch.
 */
class BeaconStateContext {
    constructor(type, tree, previousEpochParticipationCache, currentEpochParticipationCache, inactivityScoresCache, epochCtx) {
        this.config = epochCtx.config;
        this.type = type;
        this.tree = tree;
        this.epochCtx = epochCtx;
        this.balanceList = new balanceList_1.BalanceList(this.type.fields["balances"], this.type.tree_getProperty(this.tree, "balances"));
        this.previousEpochParticipation = new Proxy(new cachedEpochParticipation_1.CachedEpochParticipation({
            type: this.type.fields["previousEpochParticipation"],
            tree: this.type.tree_getProperty(this.tree, "previousEpochParticipation"),
            persistent: previousEpochParticipationCache,
        }), cachedEpochParticipation_1.CachedEpochParticipationProxyHandler);
        this.currentEpochParticipation = new Proxy(new cachedEpochParticipation_1.CachedEpochParticipation({
            type: this.type.fields["currentEpochParticipation"],
            tree: this.type.tree_getProperty(this.tree, "currentEpochParticipation"),
            persistent: currentEpochParticipationCache,
        }), cachedEpochParticipation_1.CachedEpochParticipationProxyHandler);
        this.inactivityScores = new Proxy(new cachedInactivityScoreList_1.CachedInactivityScoreList(this.type.fields["inactivityScores"], this.type.tree_getProperty(this.tree, "inactivityScores"), inactivityScoresCache), cachedInactivityScoreList_1.CachedInactivityScoreListProxyHandler);
    }
    clone() {
        return new Proxy(new BeaconStateContext(this.type, this.tree.clone(), this.previousEpochParticipation.persistent.clone(), this.currentEpochParticipation.persistent.clone(), this.inactivityScores.persistent.clone(), this.epochCtx.copy()), exports.CachedBeaconStateProxyHandler);
    }
    /**
     * Toggle all `MutableVector` caches to use `TransientVector`
     */
    setStateCachesAsTransient() {
        this.previousEpochParticipation.persistent.asTransient();
        this.currentEpochParticipation.persistent.asTransient();
        this.inactivityScores.persistent.asTransient();
    }
    /**
     * Toggle all `MutableVector` caches to use `PersistentVector`
     */
    setStateCachesAsPersistent() {
        this.previousEpochParticipation.persistent.asPersistent();
        this.currentEpochParticipation.persistent.asPersistent();
        this.inactivityScores.persistent.asPersistent();
    }
}
exports.BeaconStateContext = BeaconStateContext;
// eslint-disable-next-line @typescript-eslint/naming-convention
exports.CachedBeaconStateProxyHandler = {
    get(target, key) {
        if (key === "balanceList") {
            return target.balanceList;
        }
        else if (key === "previousEpochParticipation") {
            return target.previousEpochParticipation;
        }
        else if (key === "currentEpochParticipation") {
            return target.currentEpochParticipation;
        }
        else if (key === "inactivityScores") {
            return target.inactivityScores;
        }
        else if (target.type.fields[key] !== undefined) {
            const propType = target.type.fields[key];
            const propValue = target.type.tree_getProperty(target.tree, key);
            if (!(0, ssz_1.isCompositeType)(propType)) {
                return propValue;
            }
            else {
                return propType.createTreeBacked(propValue);
            }
        }
        else if (key in target.epochCtx) {
            return target.epochCtx[key];
        }
        else if (key in target) {
            return target[key];
        }
        else {
            const treeBacked = target.type.createTreeBacked(target.tree);
            if (key in treeBacked) {
                return treeBacked[key];
            }
        }
        return undefined;
    },
    set(target, key, value) {
        if (key === "validators") {
            throw new Error("Cannot set validators");
        }
        else if (key === "balanceList" || key === "balances") {
            throw new Error("Cannot set either balanceList or balances");
        }
        else if (key === "previousEpochParticipation") {
            throw new Error("Cannot set previousEpochParticipation");
        }
        else if (key === "currentEpochParticipation") {
            throw new Error("Cannot set currentEpochParticipation");
        }
        else if (key === "inactivityScores") {
            throw new Error("Cannot set inactivityScores");
        }
        else if (target.type.fields[key] !== undefined) {
            const propType = target.type.fields[key];
            if (!(0, ssz_1.isCompositeType)(propType)) {
                return target.type.tree_setProperty(target.tree, key, value);
            }
            else {
                if ((0, ssz_1.isTreeBacked)(value)) {
                    return target.type.tree_setProperty(target.tree, key, value.tree);
                }
                else {
                    return target.type.tree_setProperty(target.tree, key, propType.struct_convertToTree(value));
                }
            }
        }
        return false;
    },
};
//# sourceMappingURL=cachedBeaconState.js.map