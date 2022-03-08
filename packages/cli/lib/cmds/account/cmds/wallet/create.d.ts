import { ICliCommand, ICliCommandOptions } from "../../../../util";
import { IGlobalArgs } from "../../../../options";
import { IAccountWalletArgs } from "./options";
export declare const command = "create";
export declare const description = "Creates a new HD (hierarchical-deterministic) EIP-2386 wallet";
export declare type IWalletCreateArgs = {
    name: string;
    passphraseFile: string;
    type: string;
    mnemonicOutputPath?: string;
};
export declare const walletCreateOptions: ICliCommandOptions<IWalletCreateArgs>;
export declare type ReturnType = {
    mnemonic: string;
    uuid: string;
    password: string;
};
export declare const create: ICliCommand<IWalletCreateArgs, IAccountWalletArgs & IGlobalArgs, ReturnType>;
//# sourceMappingURL=create.d.ts.map