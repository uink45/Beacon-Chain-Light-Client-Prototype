import { allForks, CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { Root, allForks as allForkTypes, Slot } from "@chainsafe/lodestar-types";
import { IBlsVerifier } from "../../chain/bls";
import { BackfillSyncErrorCode } from "./errors";
export declare type BackfillBlockHeader = {
    slot: Slot;
    root: Root;
};
export declare type BackfillBlock = BackfillBlockHeader & {
    block: allForks.SignedBeaconBlock;
};
export declare function verifyBlockSequence(config: IBeaconConfig, blocks: allForkTypes.SignedBeaconBlock[], anchorRoot: Root): {
    nextAnchor: BackfillBlock | null;
    verifiedBlocks: allForkTypes.SignedBeaconBlock[];
    error?: BackfillSyncErrorCode.NOT_LINEAR;
};
export declare function verifyBlockProposerSignature(bls: IBlsVerifier, state: CachedBeaconStateAllForks, blocks: allForkTypes.SignedBeaconBlock[]): Promise<void>;
//# sourceMappingURL=verify.d.ts.map