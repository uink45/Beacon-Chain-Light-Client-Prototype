import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { IDatabaseController, IDbMetrics, Repository } from "@chainsafe/lodestar-db";
import { phase0 } from "@chainsafe/lodestar-types";
/**
 * Block headers by block root. Until finality includes all headers seen by this node. After finality,
 * all non-checkpoint headers are pruned from this repository.
 *
 * Used to prepare light client updates
 */
export declare class CheckpointHeaderRepository extends Repository<Uint8Array, phase0.BeaconBlockHeader> {
    constructor(config: IChainForkConfig, db: IDatabaseController<Uint8Array, Uint8Array>, metrics?: IDbMetrics);
}
//# sourceMappingURL=lightclientCheckpointHeader.d.ts.map