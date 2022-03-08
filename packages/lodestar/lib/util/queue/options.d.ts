import { IGauge, IHistogram } from "../../metrics";
export declare enum QueueType {
    FIFO = "FIFO",
    LIFO = "LIFO"
}
export declare type JobQueueOpts = {
    maxLength: number;
    /** Defaults to 1 */
    maxConcurrency?: number;
    /** Yield to the macro queue every at least every N miliseconds */
    yieldEveryMs?: number;
    signal: AbortSignal;
    /** Defaults to FIFO */
    type?: QueueType;
};
export interface IQueueMetrics {
    length: IGauge;
    droppedJobs: IGauge;
    /** Compute async utilization rate with `rate(metrics_name[1m])` */
    jobTime: IHistogram;
    jobWaitTime: IHistogram;
}
export declare const defaultQueueOpts: Required<Pick<JobQueueOpts, "maxConcurrency" | "yieldEveryMs" | "type">>;
//# sourceMappingURL=options.d.ts.map