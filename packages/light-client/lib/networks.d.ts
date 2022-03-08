import { RootHex } from "@chainsafe/lodestar-types";
declare enum NetworkName {
    mainnet = "mainnet",
    prater = "prater",
    kintsugi = "kintsugi"
}
export declare type GenesisDataHex = {
    genesisTime: number;
    genesisValidatorsRoot: RootHex;
};
export declare type GenesisData = {
    genesisTime: number;
    genesisValidatorsRoot: RootHex | Uint8Array;
};
export declare const networkGenesis: Record<NetworkName, GenesisDataHex>;
export {};
//# sourceMappingURL=networks.d.ts.map