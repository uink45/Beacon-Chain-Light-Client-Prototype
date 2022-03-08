import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Api } from "@chainsafe/lodestar-api";
import { IClock, ILoggerVc } from "../util";
import { ValidatorStore } from "./validatorStore";
/**
 * Service that sets up and handles validator block proposal duties.
 */
export declare class BlockProposingService {
    private readonly config;
    private readonly logger;
    private readonly api;
    private readonly validatorStore;
    private readonly graffiti?;
    private readonly dutiesService;
    constructor(config: IChainForkConfig, logger: ILoggerVc, api: Api, clock: IClock, validatorStore: ValidatorStore, graffiti?: string | undefined);
    /**
     * `BlockDutiesService` must call this fn to trigger block creation
     * This function may run more than once at a time, rationale in `BlockDutiesService.pollBeaconProposers`
     */
    private notifyBlockProductionFn;
    /** Produce a block at the given slot for pubkey */
    private createAndPublishBlock;
    /** Wrapper around the API's different methods for producing blocks across forks */
    private produceBlock;
}
//# sourceMappingURL=block.d.ts.map