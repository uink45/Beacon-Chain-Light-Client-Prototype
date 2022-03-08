import { SecretKey } from "@chainsafe/bls";
import { IGlobalArgs } from "../../options";
import { IValidatorCliArgs } from "./options";
export declare function getLocalSecretKeys(args: IValidatorCliArgs & IGlobalArgs): Promise<{
    secretKeys: SecretKey[];
    unlockSecretKeys?: () => void;
}>;
export declare type SignerRemote = {
    externalSignerUrl: string;
    pubkeyHex: string;
};
/**
 * Gets SignerRemote objects from CLI args
 */
export declare function getExternalSigners(args: IValidatorCliArgs & IGlobalArgs): Promise<SignerRemote[]>;
/**
 * Only used for logging remote signers grouped by URL
 */
export declare function groupExternalSignersByUrl(externalSigners: SignerRemote[]): {
    externalSignerUrl: string;
    pubkeysHex: string[];
}[];
export declare function resolveKeystorePaths(fileOrDirPath: string): string[];
//# sourceMappingURL=keys.d.ts.map