import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Api } from "@chainsafe/lodestar-api";
import { IClock, ILoggerVc } from "../util";
import { ValidatorStore } from "./validatorStore";
import { IndicesService } from "./indices";
import { ChainHeaderTracker } from "./chainHeaderTracker";
/**
 * Service that sets up and handles validator sync duties.
 */
export declare class SyncCommitteeService {
    private readonly config;
    private readonly logger;
    private readonly api;
    private readonly clock;
    private readonly validatorStore;
    private readonly chainHeaderTracker;
    private readonly dutiesService;
    constructor(config: IChainForkConfig, logger: ILoggerVc, api: Api, clock: IClock, validatorStore: ValidatorStore, chainHeaderTracker: ChainHeaderTracker, indicesService: IndicesService);
    private runSyncCommitteeTasks;
    /**
     * Performs the first step of the attesting process: downloading `SyncCommittee` objects,
     * signing them and returning them to the validator.
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/validator.md#attesting
     *
     * Only one `SyncCommittee` is downloaded from the BN. It is then signed by each
     * validator and the list of individually-signed `SyncCommittee` objects is returned to the BN.
     */
    private produceAndPublishSyncCommittees;
    /**
     * Performs the second step of the attesting process: downloading an aggregated `SyncCommittee`,
     * converting it into a `SignedAggregateAndProof` and returning it to the BN.
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/validator.md#broadcast-aggregate
     *
     * Only one aggregated `SyncCommittee` is downloaded from the BN. It is then signed
     * by each validator and the list of individually-signed `SignedAggregateAndProof` objects is
     * returned to the BN.
     */
    private produceAndPublishAggregates;
}
//# sourceMappingURL=syncCommittee.d.ts.map