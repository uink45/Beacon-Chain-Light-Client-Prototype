import { Histogram, HistogramConfiguration } from "prom-client";
import { IHistogram } from "../interface";
declare type Labels<T extends string> = Partial<Record<T, string | number>>;
/**
 * Extends the prom-client Histogram with extra features:
 * - Add multiple collect functions after instantiation
 * - Create child histograms with fixed labels
 */
export declare class HistogramExtra<T extends string> extends Histogram<T> implements IHistogram {
    constructor(configuration: HistogramConfiguration<T>);
    child(labels: Labels<T>): HistogramChild<T>;
}
export declare class HistogramChild<T extends string> implements IHistogram {
    histogram: HistogramExtra<T>;
    labelsParent: Labels<T>;
    constructor(labelsParent: Labels<T>, histogram: HistogramExtra<T>);
    observe(value?: number): void;
    observe(labels: Labels<T>, value?: number): void;
    startTimer(arg1?: Labels<T>): (labels?: Labels<T>) => number;
}
export {};
//# sourceMappingURL=histogram.d.ts.map