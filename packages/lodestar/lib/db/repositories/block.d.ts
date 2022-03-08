/// <reference types="node" />
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Db, IDbMetrics, Repository } from "@chainsafe/lodestar-db";
import { allForks } from "@chainsafe/lodestar-types";
/**
 * Blocks by root
 *
 * Used to store unfinalized blocks
 */
export declare class BlockRepository extends Repository<Uint8Array, allForks.SignedBeaconBlock> {
    constructor(config: IChainForkConfig, db: Db, metrics?: IDbMetrics);
    /**
     * Id is hashTreeRoot of unsigned BeaconBlock
     */
    getId(value: allForks.SignedBeaconBlock): Uint8Array;
    encodeValue(value: allForks.SignedBeaconBlock): Buffer;
    decodeValue(data: Buffer): allForks.SignedBeaconBlock;
}
//# sourceMappingURL=block.d.ts.map