"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getENRForkID = exports.MetadataController = exports.SubnetType = exports.ENRKey = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const constants_1 = require("../constants");
const forks_1 = require("./forks");
var ENRKey;
(function (ENRKey) {
    ENRKey["tcp"] = "tcp";
    ENRKey["eth2"] = "eth2";
    ENRKey["attnets"] = "attnets";
    ENRKey["syncnets"] = "syncnets";
})(ENRKey = exports.ENRKey || (exports.ENRKey = {}));
var SubnetType;
(function (SubnetType) {
    SubnetType["attnets"] = "attnets";
    SubnetType["syncnets"] = "syncnets";
})(SubnetType = exports.SubnetType || (exports.SubnetType = {}));
/**
 * Implementation of eth2 p2p MetaData.
 * For the spec that this code is based on, see:
 * https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/p2p-interface.md#metadata
 */
class MetadataController {
    constructor(opts, modules) {
        this.config = modules.config;
        this.chain = modules.chain;
        this.logger = modules.logger;
        this._metadata = opts.metadata || lodestar_types_1.ssz.altair.Metadata.defaultValue();
    }
    start(enr, currentFork) {
        this.enr = enr;
        if (this.enr) {
            // updateEth2Field() MUST be called with clock epoch
            this.updateEth2Field(this.chain.clock.currentEpoch);
            this.enr.set(ENRKey.attnets, lodestar_types_1.ssz.phase0.AttestationSubnets.serialize(this._metadata.attnets));
            // Any fork after altair included
            if (currentFork !== lodestar_params_1.ForkName.phase0) {
                // Only persist syncnets if altair fork is already activated. If currentFork is altair but head is phase0
                // adding syncnets to the ENR is not a problem, we will just have a useless field for a few hours.
                this.enr.set(ENRKey.syncnets, lodestar_types_1.ssz.phase0.AttestationSubnets.serialize(this._metadata.syncnets));
            }
        }
    }
    get seqNumber() {
        return this._metadata.seqNumber;
    }
    get syncnets() {
        return this._metadata.syncnets;
    }
    set syncnets(syncnets) {
        if (this.enr) {
            this.enr.set(ENRKey.syncnets, lodestar_types_1.ssz.altair.SyncSubnets.serialize(syncnets));
        }
        this._metadata.syncnets = syncnets;
    }
    get attnets() {
        return this._metadata.attnets;
    }
    set attnets(attnets) {
        if (this.enr) {
            this.enr.set(ENRKey.attnets, lodestar_types_1.ssz.phase0.AttestationSubnets.serialize(attnets));
        }
        this._metadata.seqNumber++;
        this._metadata.attnets = attnets;
    }
    /** Consumers that need the phase0.Metadata type can just ignore the .syncnets property */
    get json() {
        return this._metadata;
    }
    /**
     * From spec:
     *   fork_digest is compute_fork_digest(current_fork_version, genesis_validators_root) where
     *   - current_fork_version is the fork version at the node's current epoch defined by the wall-clock time (not
     *     necessarily the epoch to which the node is sync)
     *   - genesis_validators_root is the static Root found in state.genesis_validators_root
     *
     * 1. MUST be called on start to populate ENR
     * 2. Network MUST call this method on fork transition.
     *    Current Clock implementation ensures no race conditions, epoch is correct if re-fetched
     */
    updateEth2Field(epoch) {
        if (this.enr) {
            const enrForkId = lodestar_types_1.ssz.phase0.ENRForkID.serialize(getENRForkID(this.config, epoch));
            this.logger.verbose(`Updated ENR.eth2: ${(0, ssz_1.toHexString)(enrForkId)}`);
            this.enr.set(ENRKey.eth2, enrForkId);
        }
    }
}
exports.MetadataController = MetadataController;
function getENRForkID(config, clockEpoch) {
    const { currentFork, nextFork } = (0, forks_1.getCurrentAndNextFork)(config, clockEpoch);
    return {
        // Current fork digest
        forkDigest: config.forkName2ForkDigest(currentFork.name),
        // next planned fork versin
        nextForkVersion: nextFork ? nextFork.version : currentFork.version,
        // next fork epoch
        nextForkEpoch: nextFork ? nextFork.epoch : constants_1.FAR_FUTURE_EPOCH,
    };
}
exports.getENRForkID = getENRForkID;
//# sourceMappingURL=metadata.js.map