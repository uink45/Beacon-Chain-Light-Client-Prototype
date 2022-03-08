import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { BLSSignature, Slot } from "@chainsafe/lodestar-types";
import { Api, routes } from "@chainsafe/lodestar-api";
import { IndicesService } from "./indices";
import { IClock, ILoggerVc } from "../util";
import { ValidatorStore } from "./validatorStore";
export declare type SyncSelectionProof = {
    /** This value is only set to not null if the proof indicates that the validator is an aggregator. */
    selectionProof: BLSSignature | null;
    subcommitteeIndex: number;
};
/** Neatly joins SyncDuty with the locally-generated `selectionProof`. */
export declare type SyncDutyAndProofs = {
    duty: routes.validator.SyncDuty;
    selectionProofs: SyncSelectionProof[];
};
/**
 * Validators are part of a static long (~27h) sync committee, and part of static subnets.
 * However, the isAggregator role changes per slot.
 */
export declare class SyncCommitteeDutiesService {
    private readonly config;
    private readonly logger;
    private readonly api;
    private readonly validatorStore;
    private readonly indicesService;
    /** Maps a validator public key to their duties for each slot */
    private readonly dutiesByIndexByPeriod;
    constructor(config: IChainForkConfig, logger: ILoggerVc, api: Api, clock: IClock, validatorStore: ValidatorStore, indicesService: IndicesService);
    /**
     * Returns all `ValidatorDuty` for the given `slot`
     *
     * Note: The range of slots a validator has to perform duties is off by one.
     * The previous slot wording means that if your validator is in a sync committee for a period that runs from slot
     * 100 to 200,then you would actually produce signatures in slot 99 - 199.
     * https://github.com/ethereum/eth2.0-specs/pull/2400
     */
    getDutiesAtSlot(slot: Slot): Promise<SyncDutyAndProofs[]>;
    private runDutiesTasks;
    /**
     * Query the beacon node for SyncDuties for any known validators.
     *
     * This function will perform (in the following order):
     *
     * 1. Poll for current-period duties and update the local duties map.
     * 2. As above, but for the next-period.
     * 3. Push out any Sync subnet subscriptions to the BN.
     * 4. Prune old entries from duties.
     */
    private pollSyncCommittees;
    /**
     * For the given `indexArr`, download the duties for the given `period` and store them in duties.
     */
    private pollSyncCommitteesForEpoch;
    private getSelectionProofs;
    /** Run at least once per period to prune duties map */
    private pruneOldDuties;
}
//# sourceMappingURL=syncCommitteeDuties.d.ts.map