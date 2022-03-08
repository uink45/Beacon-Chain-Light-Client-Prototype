import { phase0, Slot, RootHex } from "@chainsafe/lodestar-types";
import { allForks, CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { IForkChoice } from "@chainsafe/lodestar-fork-choice";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { IMetrics } from "../../metrics";
import { IBeaconDb } from "../../db";
import { CheckpointStateCache, StateContextCache } from "../stateCache";
import { IStateRegenerator, RegenCaller } from "./interface";
import { ChainEventEmitter } from "../emitter";
export declare type RegenModules = {
    db: IBeaconDb;
    forkChoice: IForkChoice;
    stateCache: StateContextCache;
    checkpointStateCache: CheckpointStateCache;
    config: IChainForkConfig;
    emitter: ChainEventEmitter;
    metrics: IMetrics | null;
};
/**
 * Regenerates states that have already been processed by the fork choice
 */
export declare class StateRegenerator implements IStateRegenerator {
    private readonly modules;
    constructor(modules: RegenModules);
    /**
     * Get the state to run with `block`. May be:
     * - If parent is in same epoch -> Exact state at `block.parentRoot`
     * - If parent is in prev epoch -> State after `block.parentRoot` dialed forward through epoch transition
     */
    getPreState(block: allForks.BeaconBlock, rCaller: RegenCaller): Promise<CachedBeaconStateAllForks>;
    /**
     * Get state after block `cp.root` dialed forward to first slot of `cp.epoch`
     */
    getCheckpointState(cp: phase0.Checkpoint, rCaller: RegenCaller): Promise<CachedBeaconStateAllForks>;
    /**
     * Get state after block `blockRoot` dialed forward to `slot`
     */
    getBlockSlotState(blockRoot: RootHex, slot: Slot, rCaller: RegenCaller): Promise<CachedBeaconStateAllForks>;
    /**
     * Get state by exact root. If not in cache directly, requires finding the block that references the state from the
     * forkchoice and replaying blocks to get to it.
     */
    getState(stateRoot: RootHex, _rCaller: RegenCaller): Promise<CachedBeaconStateAllForks>;
    private findFirstStateBlock;
}
//# sourceMappingURL=regen.d.ts.map