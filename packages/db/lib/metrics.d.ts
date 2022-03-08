export declare type DbMetricLabels = "bucket";
export interface IDbMetrics {
    dbReads: DbMetricCounter;
    dbWrites: DbMetricCounter;
}
export declare type DbMetricCounter = ICounter<DbMetricLabels>;
export interface ICounter<T extends string> {
    labels(labels: Partial<Record<T, string | number>>): {
        inc(value?: number): void;
    };
}
//# sourceMappingURL=metrics.d.ts.map