import { IBeaconNodeOptions } from "@chainsafe/lodestar";
import { ICliCommandOptions } from "../../util";
export interface IChainArgs {
    "chain.blsVerifyAllMultiThread": boolean;
    "chain.blsVerifyAllMainThread": boolean;
    "chain.disableBlsBatchVerify": boolean;
    "chain.persistInvalidSszObjects": boolean;
    "chain.proposerBoostEnabled": boolean;
    "safe-slots-to-import-optimistically": number;
}
export declare function parseArgs(args: IChainArgs): IBeaconNodeOptions["chain"];
export declare const options: ICliCommandOptions<IChainArgs>;
//# sourceMappingURL=chain.d.ts.map