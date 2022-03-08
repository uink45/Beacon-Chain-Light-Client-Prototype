import { BLSPubkey, Root } from "@chainsafe/lodestar-types";
import { SlashingProtectionAttestation, SlashingProtectionBlock } from "../types";
import { IInterchangeCompleteV4 } from "./formats/completeV4";
import { IInterchangeV5 } from "./formats/v5";
export declare type Interchange = IInterchangeV5 | IInterchangeCompleteV4;
export declare type InterchangeFormatVersion = {
    format?: "complete";
    version: "4" | "5";
};
export interface IInterchangeLodestar {
    genesisValidatorsRoot: Root;
    data: {
        pubkey: BLSPubkey;
        signedBlocks: SlashingProtectionBlock[];
        signedAttestations: SlashingProtectionAttestation[];
    }[];
}
//# sourceMappingURL=types.d.ts.map