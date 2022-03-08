import { ICliCommand } from "../../../../util";
import { IGlobalArgs } from "../../../../options";
import { IWalletCreateArgs } from "./create";
export declare type IWalletRecoverArgs = IWalletCreateArgs & {
    mnemonicInputPath: string;
};
export declare type ReturnType = string[];
export declare const recover: ICliCommand<IWalletRecoverArgs, IGlobalArgs, ReturnType>;
//# sourceMappingURL=recover.d.ts.map