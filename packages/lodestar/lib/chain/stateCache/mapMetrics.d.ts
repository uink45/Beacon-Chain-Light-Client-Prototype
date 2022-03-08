import { IAvgMinMax } from "../../metrics";
declare type MapTrackerMetrics = {
    reads: IAvgMinMax;
    secondsSinceLastRead: IAvgMinMax;
};
export declare class MapTracker<K, V> extends Map<K, V> {
    /** Tracks the number of reads each entry in the cache gets for metrics */
    readonly readCount: Map<K, number>;
    /** Tracks the last time a state was read from the cache */
    readonly lastRead: Map<K, number>;
    constructor(metrics?: MapTrackerMetrics);
    get(key: K): V | undefined;
    delete(key: K): boolean;
    clear(): void;
}
export {};
//# sourceMappingURL=mapMetrics.d.ts.map