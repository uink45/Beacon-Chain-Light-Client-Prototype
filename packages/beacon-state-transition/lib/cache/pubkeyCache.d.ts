import { PublicKey } from "@chainsafe/bls";
import { allForks, ValidatorIndex } from "@chainsafe/lodestar-types";
import { ByteVector } from "@chainsafe/ssz";
export declare type Index2PubkeyCache = PublicKey[];
declare type PubkeyHex = string;
export declare class PubkeyIndexMap {
    readonly map: Map<string, number>;
    get size(): number;
    /**
     * Must support reading with string for API support where pubkeys are already strings
     */
    get(key: ByteVector | Uint8Array | PubkeyHex): ValidatorIndex | undefined;
    set(key: Uint8Array, value: ValidatorIndex): void;
}
/**
 * Checks the pubkey indices against a state and adds missing pubkeys
 *
 * Mutates `pubkey2index` and `index2pubkey`
 *
 * If pubkey caches are empty: SLOW CODE - 🐢
 */
export declare function syncPubkeys(state: allForks.BeaconState, pubkey2index: PubkeyIndexMap, index2pubkey: Index2PubkeyCache): void;
export {};
//# sourceMappingURL=pubkeyCache.d.ts.map