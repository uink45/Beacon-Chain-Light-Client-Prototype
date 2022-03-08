import { Api } from "@chainsafe/lodestar-api";
import { altair, phase0, RootHex, SyncPeriod } from "@chainsafe/lodestar-types";
import { IBeaconConfig, IChainForkConfig } from "@chainsafe/lodestar-config";
import { TreeOffsetProof } from "@chainsafe/persistent-merkle-tree";
import { Path } from "@chainsafe/ssz";
import { LightclientUpdateStats } from "./utils/update";
import { SyncCommitteeFast } from "./types";
import { LightclientEmitter } from "./events";
import { GenesisData } from "./networks";
import { ILcLogger } from "./utils/logger";
export { LightclientEvent } from "./events";
export declare type LightclientInitArgs = {
    config: IChainForkConfig;
    logger?: ILcLogger;
    genesisData: {
        genesisTime: number;
        genesisValidatorsRoot: RootHex | Uint8Array;
    };
    beaconApiUrl: string;
    snapshot: {
        header: phase0.BeaconBlockHeader;
        currentSyncCommittee: altair.SyncCommittee;
    };
};
/**
 * Server-based Lightclient. Current architecture diverges from the spec's proposed updated splitting them into:
 * - Sync period updates: To advance to the next sync committee
 * - Header updates: To get a more recent header signed by a known sync committee
 *
 * To stay synced to the current sync period it needs:
 * - GET lightclient/committee_updates at least once per period.
 *
 * To get continuous header updates:
 * - subscribe to SSE type lightclient_update
 *
 * To initialize, it needs:
 * - GenesisData: To initialize the clock and verify signatures
 *   - For known networks it's hardcoded in the source
 *   - For unknown networks it can be provided by the user with a manual input
 *   - For unknown test networks it can be queried from a trusted node at GET beacon/genesis
 * - `beaconApiUrl`: To connect to a trustless beacon node
 * - `LightclientStore`: To have an initial trusted SyncCommittee to start the sync
 *   - For new lightclient instances, it can be queries from a trustless node at GET lightclient/snapshot
 *   - For existing lightclient instances, it should be retrieved from storage
 *
 * When to trigger a committee update sync:
 *
 *  period 0         period 1         period 2
 * -|----------------|----------------|----------------|-> time
 *              | now
 *               - active current_sync_committee
 *               - known next_sync_committee, signed by current_sync_committee
 *
 * - No need to query for period 0 next_sync_committee until the end of period 0
 * - During most of period 0, current_sync_committe known, next_sync_committee unknown
 * - At the end of period 0, get a sync committe update, and populate period 1's committee
 *
 * syncCommittees: Map<SyncPeriod, SyncCommittee>, limited to max of 2 items
 */
export declare class Lightclient {
    readonly api: Api;
    readonly emitter: LightclientEmitter;
    readonly config: IBeaconConfig;
    readonly logger: ILcLogger;
    readonly genesisValidatorsRoot: Uint8Array;
    readonly genesisTime: number;
    readonly beaconApiUrl: string;
    /**
     * Map of period -> SyncCommittee. Uses a Map instead of spec's current and next fields to allow more flexible sync
     * strategies. In this case the Lightclient won't attempt to fetch the next SyncCommittee until the end of the
     * current period. This Map approach is also flexible in case header updates arrive in mixed ordering.
     */
    readonly syncCommitteeByPeriod: Map<number, LightclientUpdateStats & SyncCommitteeFast>;
    /**
     * Register participation by period. Lightclient only accepts updates that have sufficient participation compared to
     * previous updates with a factor of SAFETY_THRESHOLD_FACTOR.
     */
    private readonly maxParticipationByPeriod;
    private head;
    private status;
    constructor({ config, logger, genesisData, beaconApiUrl, snapshot }: LightclientInitArgs);
    static initializeFromCheckpointRoot({ config, logger, beaconApiUrl, genesisData, checkpointRoot, }: {
        config: IChainForkConfig;
        logger?: ILcLogger;
        beaconApiUrl: string;
        genesisData: GenesisData;
        checkpointRoot: phase0.Checkpoint["root"];
    }): Promise<Lightclient>;
    start(): void;
    stop(): void;
    get currentSlot(): number;
    getHead(): phase0.BeaconBlockHeader;
    /** Returns header since head may change during request */
    getHeadStateProof(paths: Path[]): Promise<{
        proof: TreeOffsetProof;
        header: phase0.BeaconBlockHeader;
    }>;
    sync(fromPeriod: SyncPeriod, toPeriod: SyncPeriod): Promise<void>;
    private runLoop;
    private onSSE;
    /**
     * Processes new header updates in only known synced sync periods.
     * This headerUpdate may update the head if there's enough participation.
     */
    private processHeaderUpdate;
    /**
     * Process SyncCommittee update, signed by a known previous SyncCommittee.
     * SyncCommittee can be updated at any time, not strictly at the period borders.
     *
     *  period 0         period 1         period 2
     * -|----------------|----------------|----------------|-> time
     *                   | now
     *                     - active current_sync_committee: period 0
     *                     - known next_sync_committee, signed by current_sync_committee
     */
    private processSyncCommitteeUpdate;
}
//# sourceMappingURL=index.d.ts.map