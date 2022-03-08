import { ethers } from "ethers";
/**
 * Returns a connected ethers signer from a variety of provider options
 */
export declare function getEthersSigner({ keystorePath, keystorePassword, rpcUrl, rpcPassword, ipcPath, chainId, }: {
    keystorePath?: string;
    keystorePassword?: string;
    rpcUrl?: string;
    rpcPassword?: string;
    ipcPath?: string;
    chainId: number;
}): Promise<ethers.Signer>;
//# sourceMappingURL=ethers.d.ts.map