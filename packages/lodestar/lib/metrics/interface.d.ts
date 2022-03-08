import { Gauge, Histogram } from "prom-client";
export declare type IGauge<T extends string = string> = Pick<Gauge<T>, "inc" | "set"> & {
    addCollect: (collectFn: () => void) => void;
};
export declare type IHistogram<T extends string = string> = Pick<Histogram<T>, "observe" | "startTimer">;
export declare type IAvgMinMax = {
    addGetValuesFn(getValuesFn: () => number[]): void;
    set(values: number[]): void;
};
//# sourceMappingURL=interface.d.ts.map