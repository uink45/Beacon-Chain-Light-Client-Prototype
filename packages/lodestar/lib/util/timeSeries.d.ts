export declare class TimeSeries {
    private points;
    private startTimeSec;
    private maxPoints;
    constructor(opts?: {
        maxPoints?: number;
    });
    /** Add TimeSeries entry for value at current time */
    addPoint(value: number, timeMs?: number): void;
    /** Compute the slope of all registered points assuming linear regression */
    computeLinearSpeed(): number;
    /** Remove all entries */
    clear(): void;
}
//# sourceMappingURL=timeSeries.d.ts.map