import { BLSPubkey, Slot } from "@chainsafe/lodestar-types";
import { Api } from "@chainsafe/lodestar-api";
import { IClock, ILoggerVc } from "../util";
import { ValidatorStore } from "./validatorStore";
export declare const GENESIS_SLOT = 0;
declare type NotifyBlockProductionFn = (slot: Slot, proposers: BLSPubkey[]) => void;
export declare class BlockDutiesService {
    private readonly logger;
    private readonly api;
    private readonly validatorStore;
    /** Notify the block service if it should produce a block. */
    private readonly notifyBlockProductionFn;
    /** Maps an epoch to all *local* proposers in this epoch. Notably, this does not contain
        proposals for any validators which are not registered locally. */
    private readonly proposers;
    constructor(logger: ILoggerVc, api: Api, clock: IClock, validatorStore: ValidatorStore, notifyBlockProductionFn: NotifyBlockProductionFn);
    /**
     * Returns the pubkeys of the validators which are assigned to propose in the given slot.
     *
     * It is possible that multiple validators have an identical proposal slot, however that is
     * likely the result of heavy forking (lol) or inconsistent beacon node connections.
     */
    getblockProposersAtSlot(slot: Slot): BLSPubkey[];
    private runBlockDutiesTask;
    /**
     * Download the proposer duties for the current epoch and store them in `this.proposers`.
     * If there are any proposer for this slot, send out a notification to the block proposers.
     *
     * ## Note
     *
     * This function will potentially send *two* notifications to the `BlockService`; it will send a
     * notification initially, then it will download the latest duties and send a *second* notification
     * if those duties have changed. This behaviour simultaneously achieves the following:
     *
     * 1. Block production can happen immediately and does not have to wait for the proposer duties to
     *    download.
     * 2. We won't miss a block if the duties for the current slot happen to change with this poll.
     *
     * This sounds great, but is it safe? Firstly, the additional notification will only contain block
     * producers that were not included in the first notification. This should be safety enough.
     * However, we also have the slashing protection as a second line of defence. These two factors
     * provide an acceptable level of safety.
     *
     * It's important to note that since there is a 0-epoch look-ahead (i.e., no look-ahead) for block
     * proposers then it's very likely that a proposal for the first slot of the epoch will need go
     * through the slow path every time. I.e., the proposal will only happen after we've been able to
     * download and process the duties from the BN. This means it is very important to ensure this
     * function is as fast as possible.
     */
    private pollBeaconProposersAndNotify;
    private pollBeaconProposers;
    /** Run once per epoch to prune `this.proposers` map */
    private pruneOldDuties;
}
export {};
//# sourceMappingURL=blockDuties.d.ts.map