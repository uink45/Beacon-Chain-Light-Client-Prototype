import { ICliCommand } from "../../../../util";
import { IGlobalArgs } from "../../../../options";
import { IValidatorCreateArgs } from "./create";
export declare type IValidatorRecoverArgs = Pick<IValidatorCreateArgs, "count" | "depositGwei" | "storeWithdrawalKeystore"> & {
    mnemonicInputPath: string;
    firstIndex: number;
};
export declare type ReturnType = string[];
export declare const recover: ICliCommand<IValidatorRecoverArgs, IGlobalArgs, ReturnType>;
//# sourceMappingURL=recover.d.ts.map