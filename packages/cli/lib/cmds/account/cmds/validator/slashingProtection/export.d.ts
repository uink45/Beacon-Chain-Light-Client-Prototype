import { ICliCommand } from "../../../../../util";
import { IGlobalArgs } from "../../../../../options";
import { IAccountValidatorArgs } from "../options";
import { ISlashingProtectionArgs } from "./options";
interface IExportArgs {
    file: string;
}
export declare const exportCmd: ICliCommand<IExportArgs, ISlashingProtectionArgs & IAccountValidatorArgs & IGlobalArgs>;
export {};
//# sourceMappingURL=export.d.ts.map