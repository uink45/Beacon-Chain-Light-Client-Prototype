import { phase0 } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { SecretKey, PublicKey } from "@chainsafe/bls";
export declare function decodeEth1TxData(bytes: string, amount: string): {
    depositData: phase0.DepositData;
    root: string;
};
export declare function encodeDepositData(amount: number, withdrawalPublicKey: PublicKey, signingKey: SecretKey, config: IChainForkConfig): string;
//# sourceMappingURL=depositData.d.ts.map