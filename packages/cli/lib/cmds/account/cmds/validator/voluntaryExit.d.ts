import { ICliCommand } from "../../../../util";
import { IGlobalArgs } from "../../../../options";
import { IValidatorCliArgs } from "../../../validator/options";
export declare type IValidatorVoluntaryExitArgs = IValidatorCliArgs & {
    publicKey: string;
    exitEpoch: number;
};
export declare type ReturnType = string[];
export declare const voluntaryExit: ICliCommand<IValidatorVoluntaryExitArgs, IGlobalArgs>;
//# sourceMappingURL=voluntaryExit.d.ts.map