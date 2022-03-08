import { BLSSignature, Slot } from "@chainsafe/lodestar-types";
import { Api, routes } from "@chainsafe/lodestar-api";
import { IndicesService } from "./indices";
import { IClock, ILoggerVc } from "../util";
import { ValidatorStore } from "./validatorStore";
import { ChainHeaderTracker } from "./chainHeaderTracker";
/** Neatly joins the server-generated `AttesterData` with the locally-generated `selectionProof`. */
export declare type AttDutyAndProof = {
    duty: routes.validator.AttesterDuty;
    /** This value is only set to not null if the proof indicates that the validator is an aggregator. */
    selectionProof: BLSSignature | null;
};
export declare class AttestationDutiesService {
    private readonly logger;
    private readonly api;
    private clock;
    private readonly validatorStore;
    private readonly indicesService;
    /** Maps a validator public key to their duties for each epoch */
    private readonly dutiesByIndexByEpoch;
    /**
     * We may receive new dependentRoot of an epoch but it's not the last slot of epoch
     * so we have to wait for getting close to the next epoch to redownload new attesterDuties.
     */
    private readonly pendingDependentRootByEpoch;
    constructor(logger: ILoggerVc, api: Api, clock: IClock, validatorStore: ValidatorStore, indicesService: IndicesService, chainHeadTracker: ChainHeaderTracker);
    /** Returns all `ValidatorDuty` for the given `slot` */
    getDutiesAtSlot(slot: Slot): AttDutyAndProof[];
    /**
     * If a reorg dependent root comes at a slot other than last slot of epoch
     * just update this.pendingDependentRootByEpoch() and process here
     */
    private prepareForNextEpoch;
    private runDutiesTasks;
    /**
     * Query the beacon node for attestation duties for any known validators.
     *
     * This function will perform (in the following order):
     *
     * 1. Poll for current-epoch duties and update the local duties map.
     * 2. As above, but for the next-epoch.
     * 3. Push out any attestation subnet subscriptions to the BN.
     * 4. Prune old entries from duties.
     */
    private pollBeaconAttesters;
    /**
     * For the given `indexArr`, download the duties for the given `epoch` and store them in duties.
     */
    private pollBeaconAttestersForEpoch;
    /**
     * attester duties may be reorged due to 2 scenarios:
     *   1. node is syncing (for nextEpoch duties)
     *   2. node is reorged
     * previousDutyDependentRoot = get_block_root_at_slot(state, compute_start_slot_at_epoch(epoch - 1) - 1)
     *   => dependent root of current epoch
     * currentDutyDependentRoot = get_block_root_at_slot(state, compute_start_slot_at_epoch(epoch) - 1)
     *   => dependent root of next epoch
     */
    private onNewHead;
    private handleAttesterDutiesReorg;
    private getDutyAndProof;
    /** Run once per epoch to prune duties map */
    private pruneOldDuties;
}
//# sourceMappingURL=attestationDuties.d.ts.map