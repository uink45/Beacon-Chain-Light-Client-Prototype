/**
 * Return public keys from the server.
 */
export declare function externalSignerGetKeys(externalSignerUrl: string): Promise<string[]>;
/**
 * Return signature in bytes. Assumption that the pubkey has it's corresponding secret key in the keystore of an external signer.
 */
export declare function externalSignerPostSignature(externalSignerUrl: string, pubkeyHex: string, signingRootHex: string): Promise<string>;
/**
 * Return upcheck status from server.
 */
export declare function externalSignerUpCheck(remoteUrl: string): Promise<boolean>;
//# sourceMappingURL=externalSignerClient.d.ts.map