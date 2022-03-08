import { IGlobalArgs } from "../../../../options";
import { IWalletRecoverArgs } from "./recover";
export declare function createWalletFromArgsAndMnemonic(args: Pick<IWalletRecoverArgs & IGlobalArgs, "name" | "type" | "passphraseFile" | "mnemonicOutputPath" | "rootDir">, mnemonic: string): Promise<{
    uuid: string;
    password: string;
}>;
//# sourceMappingURL=utils.d.ts.map