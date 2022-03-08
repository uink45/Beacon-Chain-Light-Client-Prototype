import { SyncChain } from "../chain";
/**
 * Priotize existing chains based on their target and peer count
 * Returns an array of chains toStart and toStop to comply with the priotization
 */
export declare function updateChains(chains: SyncChain[]): {
    toStart: SyncChain[];
    toStop: SyncChain[];
};
//# sourceMappingURL=updateChains.d.ts.map