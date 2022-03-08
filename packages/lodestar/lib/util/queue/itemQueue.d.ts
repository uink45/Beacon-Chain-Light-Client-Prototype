import { IQueueMetrics, JobQueueOpts } from "./options";
/**
 * JobQueue that stores arguments in the job array instead of closures.
 * Supports a single itemProcessor, for arbitrary functions use the JobFnQueue
 */
export declare class JobItemQueue<Args extends any[], R> {
    private readonly itemProcessor;
    private readonly opts;
    /**
     * We choose to use LinkedList instead of regular array to improve shift() / push() / pop() performance.
     * See the LinkedList benchmark for more details.
     * */
    private readonly jobs;
    private readonly metrics?;
    private runningJobs;
    private lastYield;
    constructor(itemProcessor: (...args: Args) => Promise<R>, opts: JobQueueOpts, metrics?: IQueueMetrics);
    push(...args: Args): Promise<R>;
    getItems(): {
        args: Args;
        addedTimeMs: number;
    }[];
    dropAllJobs: () => void;
    private runJob;
    private abortAllJobs;
}
//# sourceMappingURL=itemQueue.d.ts.map