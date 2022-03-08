import { ICliCommand } from "../../../../util";
import { IAccountValidatorArgs } from "./options";
import { IGlobalArgs } from "../../../../options";
interface IValidatorImportArgs {
    keystore?: string;
    directory?: string;
    passphraseFile?: string;
}
export declare const importCmd: ICliCommand<IValidatorImportArgs, IAccountValidatorArgs & IGlobalArgs>;
export {};
//# sourceMappingURL=import.d.ts.map