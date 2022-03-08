import { ICliCommandOptions, ILogArgs } from "../../util";
import { IAccountValidatorArgs } from "../account/cmds/validator/options";
import { IBeaconPaths } from "../beacon/paths";
export declare type IValidatorCliArgs = IAccountValidatorArgs & ILogArgs & {
    logFile: IBeaconPaths["logFile"];
    validatorsDbDir?: string;
    server: string;
    force: boolean;
    graffiti: string;
    importKeystoresPath?: string[];
    importKeystoresPassword?: string;
    externalSignerUrl?: string;
    externalSignerPublicKeys?: string[];
    externalSignerFetchPubkeys?: boolean;
    interopIndexes?: string;
    fromMnemonic?: string;
    mnemonicIndexes?: string;
};
export declare const validatorOptions: ICliCommandOptions<IValidatorCliArgs>;
//# sourceMappingURL=options.d.ts.map