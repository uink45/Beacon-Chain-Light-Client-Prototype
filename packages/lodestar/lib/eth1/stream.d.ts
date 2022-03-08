/**
 * @module eth1
 */
import { AbortSignal } from "@chainsafe/abort-controller";
import { Eth1Block, IBatchDepositEvents, IEth1Provider, IEth1StreamParams } from "./interface";
import { phase0 } from "@chainsafe/lodestar-types";
/**
 * Phase 1 of genesis building.
 * Not enough validators, only stream deposits
 * @param signal Abort stream returning after a while loop cycle. Aborts internal sleep
 */
export declare function getDepositsStream(fromBlock: number, provider: IEth1Provider, params: IEth1StreamParams, signal?: AbortSignal): AsyncGenerator<IBatchDepositEvents>;
/**
 * Phase 2 of genesis building.
 * There are enough validators, stream deposits and blocks
 * @param signal Abort stream returning after a while loop cycle. Aborts internal sleep
 */
export declare function getDepositsAndBlockStreamForGenesis(fromBlock: number, provider: IEth1Provider, params: IEth1StreamParams, signal?: AbortSignal): AsyncGenerator<[phase0.DepositEvent[], Eth1Block]>;
//# sourceMappingURL=stream.d.ts.map