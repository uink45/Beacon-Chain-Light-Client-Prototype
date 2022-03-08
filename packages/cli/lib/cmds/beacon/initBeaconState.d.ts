import { AbortSignal } from "@chainsafe/abort-controller";
import { TreeBacked } from "@chainsafe/ssz";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { ILogger } from "@chainsafe/lodestar-utils";
import { allForks } from "@chainsafe/lodestar-beacon-state-transition";
import { IBeaconDb, IBeaconNodeOptions } from "@chainsafe/lodestar";
import { Checkpoint } from "@chainsafe/lodestar-types/phase0";
import { IBeaconArgs } from "./options";
import { IGlobalArgs } from "../../options/globalOptions";
/**
 * Initialize a beacon state, picking the strategy based on the `IBeaconArgs`
 *
 * State is initialized in one of three ways:
 * 1. restore from weak subjectivity state (possibly downloaded from a remote beacon node)
 * 2. restore from db
 * 3. restore from genesis state (possibly downloaded via URL)
 * 4. create genesis state from eth1
 */
export declare function initBeaconState(options: IBeaconNodeOptions, args: IBeaconArgs & IGlobalArgs, chainForkConfig: IChainForkConfig, db: IBeaconDb, logger: ILogger, signal: AbortSignal): Promise<{
    anchorState: TreeBacked<allForks.BeaconState>;
    wsCheckpoint?: Checkpoint;
}>;
//# sourceMappingURL=initBeaconState.d.ts.map