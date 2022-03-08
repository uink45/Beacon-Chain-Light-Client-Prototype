import { JobItemQueue } from "./itemQueue";
import { IQueueMetrics, JobQueueOpts } from "./options";
declare type Fn<R> = (...args: any) => Promise<R>;
export declare class JobFnQueue extends JobItemQueue<[Fn<any>], any> {
    constructor(opts: JobQueueOpts, metrics?: IQueueMetrics);
    push<R, F extends Fn<R> = Fn<R>>(fn: F): Promise<R>;
}
export {};
//# sourceMappingURL=fnQueue.d.ts.map