import { AbortSignal } from "@chainsafe/abort-controller";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Slot } from "@chainsafe/lodestar-types";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IMetrics } from "../metrics";
import { IBeaconChain } from "./interface";
/**
 * When node is synced and 1/3 slot before an epoch, we want to prepare for the next epoch
 * transition from our head so that:
 * + validators vote for block head on time through attestation
 * + validators propose blocks on time
 */
export declare class PrecomputeNextEpochTransitionScheduler {
    private readonly chain;
    private readonly config;
    private readonly metrics;
    private readonly logger;
    private readonly signal;
    constructor(chain: IBeaconChain, config: IChainForkConfig, metrics: IMetrics | null, logger: ILogger, signal: AbortSignal);
    /**
     * Use clockSlot instead of clockEpoch to schedule the task at more exact time.
     */
    prepareForNextEpoch: (clockSlot: Slot) => Promise<void>;
}
//# sourceMappingURL=precomputeNextEpochTransition.d.ts.map