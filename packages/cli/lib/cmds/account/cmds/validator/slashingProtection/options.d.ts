import { ICliCommandOptions } from "../../../../../util";
import { IValidatorCliArgs } from "../../../../validator/options";
export declare type ISlashingProtectionArgs = Pick<IValidatorCliArgs, "server"> & {
    force?: boolean;
};
export declare const slashingProtectionOptions: ICliCommandOptions<ISlashingProtectionArgs>;
//# sourceMappingURL=options.d.ts.map