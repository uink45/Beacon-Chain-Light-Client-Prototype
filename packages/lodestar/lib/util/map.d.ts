export declare class MapDef<K, V> extends Map<K, V> {
    private readonly getDefault;
    constructor(getDefault: () => V);
    getOrDefault(key: K): V;
}
/**
 * 2 dimensions Es6 Map
 */
export declare class Map2d<K1, K2, V> {
    readonly map: Map<K1, Map<K2, V>>;
    get(k1: K1, k2: K2): V | undefined;
    set(k1: K1, k2: K2, v: V): void;
}
/**
 * 2 dimensions Es6 Map + regular array
 */
export declare class Map2dArr<K1, V> {
    readonly map: Map<K1, V[]>;
    get(k1: K1, idx: number): V | undefined;
    set(k1: K1, idx: number, v: V): void;
}
/**
 * Prune an arbitrary set removing the first keys to have a set.size === maxItems.
 * Returns the count of deleted items.
 */
export declare function pruneSetToMax<T>(set: Set<T> | Map<T, unknown>, maxItems: number): number;
//# sourceMappingURL=map.d.ts.map