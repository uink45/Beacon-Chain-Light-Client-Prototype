/**
 * @module validator
 */
import { SecretKey } from "@chainsafe/bls";
import { BLSPubkey } from "@chainsafe/lodestar-types";
import { IDatabaseController } from "@chainsafe/lodestar-db";
export declare type GenesisInfo = {
    startTime: number;
};
export declare type BLSKeypair = {
    publicKey: BLSPubkey;
    secretKey: SecretKey;
};
export declare type PubkeyHex = string;
export declare type LodestarValidatorDatabaseController = Pick<IDatabaseController<Uint8Array, Uint8Array>, "get" | "start" | "values" | "batchPut" | "keys" | "get" | "put">;
//# sourceMappingURL=types.d.ts.map