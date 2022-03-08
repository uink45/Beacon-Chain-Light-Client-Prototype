/**
 * @module eth1
 */
import { phase0 } from "@chainsafe/lodestar-types";
/**
 * Precomputed topics of DepositEvent logs
 */
export declare const depositEventTopics: string[];
/**
 * Parse DepositEvent log
 */
export declare function parseDepositLog(log: {
    blockNumber: number;
    data: string;
    topics: string[];
}): phase0.DepositEvent;
//# sourceMappingURL=depositContract.d.ts.map