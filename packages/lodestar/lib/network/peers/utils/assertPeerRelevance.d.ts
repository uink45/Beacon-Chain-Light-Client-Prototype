import { ForkDigest, Root, phase0 } from "@chainsafe/lodestar-types";
import { IBeaconChain } from "../../../chain";
export declare enum IrrelevantPeerCode {
    INCOMPATIBLE_FORKS = "IRRELEVANT_PEER_INCOMPATIBLE_FORKS",
    DIFFERENT_CLOCKS = "IRRELEVANT_PEER_DIFFERENT_CLOCKS",
    GENESIS_NONZERO = "IRRELEVANT_PEER_GENESIS_NONZERO",
    DIFFERENT_FINALIZED = "IRRELEVANT_PEER_DIFFERENT_FINALIZED"
}
declare type IrrelevantPeerType = {
    code: IrrelevantPeerCode.INCOMPATIBLE_FORKS;
    ours: ForkDigest;
    theirs: ForkDigest;
} | {
    code: IrrelevantPeerCode.DIFFERENT_CLOCKS;
    slotDiff: number;
} | {
    code: IrrelevantPeerCode.GENESIS_NONZERO;
    root: Root;
} | {
    code: IrrelevantPeerCode.DIFFERENT_FINALIZED;
    expectedRoot: Root;
    remoteRoot: Root;
};
/**
 * Process a `Status` message to determine if a peer is relevant to us. If the peer is
 * irrelevant the reason is returned.
 */
export declare function assertPeerRelevance(remote: phase0.Status, chain: IBeaconChain): IrrelevantPeerType | null;
export declare function isZeroRoot(root: Root): boolean;
export declare function renderIrrelevantPeerType(type: IrrelevantPeerType): string;
export {};
//# sourceMappingURL=assertPeerRelevance.d.ts.map