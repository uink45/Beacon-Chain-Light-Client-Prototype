import { ICliCommand, ICliCommandOptions } from "../../../../util";
import { IAccountValidatorArgs } from "./options";
import { IGlobalArgs } from "../../../../options";
export interface IValidatorCreateArgs {
    name: string;
    passphraseFile: string;
    depositGwei?: string;
    storeWithdrawalKeystore?: boolean;
    count: number;
}
export declare type ReturnType = string[];
export declare const validatorCreateOptions: ICliCommandOptions<IValidatorCreateArgs>;
export declare const create: ICliCommand<IValidatorCreateArgs, IAccountValidatorArgs & IGlobalArgs, ReturnType>;
//# sourceMappingURL=create.d.ts.map