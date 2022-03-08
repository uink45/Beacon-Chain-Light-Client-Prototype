import { RootHex } from "@chainsafe/lodestar-types";
import { PendingBlock } from "../interface";
export declare function getAllDescendantBlocks(blockRootHex: RootHex, blocks: Map<RootHex, PendingBlock>): PendingBlock[];
export declare function getDescendantBlocks(blockRootHex: RootHex, blocks: Map<RootHex, PendingBlock>): PendingBlock[];
export declare function getLowestPendingUnknownParents(blocks: Map<RootHex, PendingBlock>): PendingBlock[];
//# sourceMappingURL=pendingBlocksTree.d.ts.map