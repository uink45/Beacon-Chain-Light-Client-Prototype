import { Gauge, GaugeConfiguration } from "prom-client";
import { IGauge } from "../interface";
declare type CollectFn<T extends string> = (metric: IGauge<T>) => void;
declare type Labels<T extends string> = Partial<Record<T, string | number>>;
/**
 * Extends the prom-client Gauge with extra features:
 * - Add multiple collect functions after instantiation
 * - Create child gauges with fixed labels
 */
export declare class GaugeExtra<T extends string> extends Gauge<T> implements IGauge {
    private collectFns;
    constructor(configuration: GaugeConfiguration<T>);
    addCollect(collectFn: CollectFn<T>): void;
    child(labels: Labels<T>): GaugeChild<T>;
    /**
     * @override Metric.collect
     */
    private collect;
}
export declare class GaugeChild<T extends string> implements IGauge {
    gauge: GaugeExtra<T>;
    labelsParent: Labels<T>;
    constructor(labelsParent: Labels<T>, gauge: GaugeExtra<T>);
    inc(value?: number): void;
    inc(labels: Labels<T>, value?: number): void;
    set(value: number): void;
    set(labels: Labels<T>, value: number): void;
    addCollect(collectFn: CollectFn<T>): void;
}
export {};
//# sourceMappingURL=gauge.d.ts.map