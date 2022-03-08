import { IChainConfig } from "./chainConfig";
import { mainnetChainConfig } from "./chainConfig/networks/mainnet";
import { praterChainConfig } from "./chainConfig/networks/prater";
import { kintsugiChainConfig } from "./chainConfig/networks/kintsugi";
export { mainnetChainConfig, praterChainConfig, kintsugiChainConfig };
export declare type NetworkName = "mainnet" | "prater" | "kintsugi";
export declare const networksChainConfig: Record<NetworkName, IChainConfig>;
//# sourceMappingURL=networks.d.ts.map