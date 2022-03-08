import { ICliCommand } from "../../../../../util";
import { IGlobalArgs } from "../../../../../options";
import { IAccountValidatorArgs } from "../options";
import { ISlashingProtectionArgs } from "./options";
interface IImportArgs {
    file: string;
}
export declare const importCmd: ICliCommand<IImportArgs, ISlashingProtectionArgs & IAccountValidatorArgs & IGlobalArgs>;
export {};
//# sourceMappingURL=import.d.ts.map