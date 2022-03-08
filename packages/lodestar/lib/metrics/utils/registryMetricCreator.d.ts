import { GaugeConfiguration, Registry, HistogramConfiguration, CounterConfiguration, Counter } from "prom-client";
import { AvgMinMax } from "./avgMinMax";
import { GaugeExtra } from "./gauge";
import { HistogramExtra } from "./histogram";
declare type StaticConfiguration<T extends string> = {
    name: GaugeConfiguration<string>["name"];
    help: GaugeConfiguration<string>["help"];
    value: Record<T, string>;
};
export declare class RegistryMetricCreator extends Registry {
    gauge<T extends string>(configuration: GaugeConfiguration<T>): GaugeExtra<T>;
    histogram<T extends string>(configuration: HistogramConfiguration<T>): HistogramExtra<T>;
    avgMinMax<T extends string>(configuration: GaugeConfiguration<T>): AvgMinMax<T>;
    /** Static metric to send string-based data such as versions, config params, etc */
    static<T extends string>({ name, help, value }: StaticConfiguration<T>): void;
    counter<T extends string>(configuration: CounterConfiguration<T>): Counter<T>;
}
export {};
//# sourceMappingURL=registryMetricCreator.d.ts.map