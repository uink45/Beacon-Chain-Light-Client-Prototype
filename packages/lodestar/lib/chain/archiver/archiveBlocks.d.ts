import { Epoch, Slot } from "@chainsafe/lodestar-types";
import { IForkChoice } from "@chainsafe/lodestar-fork-choice";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IBeaconDb } from "../../db";
import { LightClientServer } from "../lightClient";
/**
 * Archives finalized blocks from active bucket to archive bucket.
 *
 * Only archive blocks on the same chain to the finalized checkpoint.
 * Each run should move all finalized blocks to blockArhive db to make it consistent
 * to stateArchive, so that the node always work well when we restart.
 * Note that the finalized block still stay in forkchoice to check finalize checkpoint of next onBlock calls,
 * the next run should not reprocess finalzied block of this run.
 */
export declare function archiveBlocks(db: IBeaconDb, forkChoice: IForkChoice, lightclientServer: LightClientServer, logger: ILogger, finalizedCheckpoint: {
    rootHex: string;
    epoch: Epoch;
}): Promise<void>;
/**
 * ```
 * class SignedBeaconBlock(Container):
 *   message: BeaconBlock [offset - 4 bytes]
 *   signature: BLSSignature [fixed - 96 bytes]
 *
 * class BeaconBlock(Container):
 *   slot: Slot [fixed - 8 bytes]
 *   proposer_index: ValidatorIndex [fixed - 8 bytes]
 *   parent_root: Root [fixed - 32 bytes]
 *   state_root: Root
 *   body: BeaconBlockBody
 * ```
 * From byte: `4 + 96 + 8 + 8 = 116`
 * To byte: `116 + 32 = 148`
 */
export declare function getParentRootFromSignedBlock(bytes: Uint8Array): Uint8Array;
/**
 *
 * @param blocks sequence of linear blocks, from ancestor to child.
 * In ProtoArray.getAllAncestorNodes child nodes are pushed to the returned array.
 */
export declare function getNonCheckpointBlocks<T extends {
    slot: Slot;
}>(blocks: T[]): T[];
//# sourceMappingURL=archiveBlocks.d.ts.map