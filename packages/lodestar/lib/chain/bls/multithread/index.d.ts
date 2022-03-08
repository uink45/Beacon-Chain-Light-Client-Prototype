import { AbortSignal } from "@chainsafe/abort-controller";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IMetrics } from "../../../metrics";
import { IBlsVerifier, VerifySignatureOpts } from "../interface";
import { ISignatureSet } from "@chainsafe/lodestar-beacon-state-transition";
export declare type BlsMultiThreadWorkerPoolModules = {
    logger: ILogger;
    metrics: IMetrics | null;
    signal: AbortSignal;
};
export declare type BlsMultiThreadWorkerPoolOptions = {
    blsVerifyAllMultiThread?: boolean;
};
/**
 * Wraps "threads" library thread pool queue system with the goals:
 * - Complete total outstanding jobs in total minimum time possible.
 *   Will split large signature sets into smaller sets and send to different workers
 * - Reduce the latency cost for small signature sets. In NodeJS 12,14 worker <-> main thread
 *   communiction has very high latency, of around ~5 ms. So package multiple small signature
 *   sets into packages of work and send at once to a worker to distribute the latency cost
 */
export declare class BlsMultiThreadWorkerPool implements IBlsVerifier {
    private readonly logger;
    private readonly metrics;
    private readonly signal;
    private readonly format;
    private readonly workers;
    private readonly jobs;
    private bufferedJobs;
    private blsVerifyAllMultiThread;
    constructor(options: BlsMultiThreadWorkerPoolOptions, modules: BlsMultiThreadWorkerPoolModules);
    verifySignatureSets(sets: ISignatureSet[], opts?: VerifySignatureOpts): Promise<boolean>;
    private createWorkers;
    /**
     * Register BLS work to be done eventually in a worker
     */
    private queueBlsWork;
    /**
     * Potentially submit jobs to an idle worker, only if there's a worker and jobs
     */
    private runJob;
    /**
     * Grab pending work up to a max number of signatures
     */
    private prepareWork;
    /**
     * Add all buffered jobs to the job queue and potentially run them immediatelly
     */
    private runBufferedJobs;
    /**
     * Stop all JavaScript execution in the worker thread immediatelly
     */
    private terminateAllWorkers;
    private abortAllJobs;
    /** For testing */
    private waitTillInitialized;
}
//# sourceMappingURL=index.d.ts.map