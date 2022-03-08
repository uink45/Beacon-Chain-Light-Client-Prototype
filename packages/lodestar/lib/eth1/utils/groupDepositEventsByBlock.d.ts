import { phase0 } from "@chainsafe/lodestar-types";
import { IBatchDepositEvents } from "../interface";
/**
 * Return deposit events of blocks grouped/sorted by block number and deposit index
 * Blocks without events are omitted
 * @param depositEvents range deposit events
 */
export declare function groupDepositEventsByBlock(depositEvents: phase0.DepositEvent[]): IBatchDepositEvents[];
//# sourceMappingURL=groupDepositEventsByBlock.d.ts.map