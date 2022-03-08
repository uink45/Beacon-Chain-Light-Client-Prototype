"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlsMultiThreadWorkerPool = void 0;
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
const threads_1 = require("threads");
// `threads` library creates self global variable which breaks `timeout-abort-controller` https://github.com/jacobheun/timeout-abort-controller/issues/9
// Don't add an eslint disable here as a reminder that this has to be fixed eventually
// eslint-disable-next-line
// @ts-ignore
// eslint-disable-next-line
self = undefined;
const bls_1 = require("@chainsafe/bls");
const queue_1 = require("../../../util/queue");
const types_1 = require("./types");
const utils_1 = require("./utils");
const utils_2 = require("../utils");
const maybeBatch_1 = require("../maybeBatch");
/**
 * Split big signature sets into smaller sets so they can be sent to multiple workers.
 *
 * The biggest sets happen during sync, on mainnet batches of 64 blocks have around ~8000 signatures.
 * The latency cost of sending the job to and from the worker is aprox a single sig verification.
 * If you split a big signature into 2, the extra time cost is `(2+2N)/(1+2N)`.
 * For 128, the extra time cost is about 0.3%. No specific reasoning for `128`, it's just good enough.
 */
const MAX_SIGNATURE_SETS_PER_JOB = 128;
/**
 * If there are more than `MAX_BUFFERED_SIGS` buffered sigs, verify them immediatelly without waiting `MAX_BUFFER_WAIT_MS`.
 *
 * The efficency improvement of batching sets asymptotically reaches x2. However, for batching large sets
 * has more risk in case a signature is invalid, requiring to revalidate all sets in the batch. 32 is sweet
 * point for this tradeoff.
 */
const MAX_BUFFERED_SIGS = 32;
/**
 * Gossip objects usually come in bursts. Buffering them for a short period of time allows to increase batching
 * efficieny, at the cost of delaying validation. Unless running in production shows otherwise, it's not critical
 * to hold attestations and aggregates for 100ms. Lodestar existing queues may hold those objects for much more anyway.
 *
 * There's no exact reasoning for the `100` miliseconds number. The metric `batchSigsSuccess` should indicate if this
 * value needs revision
 */
const MAX_BUFFER_WAIT_MS = 100;
var WorkerStatusCode;
(function (WorkerStatusCode) {
    WorkerStatusCode[WorkerStatusCode["notInitialized"] = 0] = "notInitialized";
    WorkerStatusCode[WorkerStatusCode["initializing"] = 1] = "initializing";
    WorkerStatusCode[WorkerStatusCode["initializationError"] = 2] = "initializationError";
    WorkerStatusCode[WorkerStatusCode["idle"] = 3] = "idle";
    WorkerStatusCode[WorkerStatusCode["running"] = 4] = "running";
})(WorkerStatusCode || (WorkerStatusCode = {}));
/**
 * Wraps "threads" library thread pool queue system with the goals:
 * - Complete total outstanding jobs in total minimum time possible.
 *   Will split large signature sets into smaller sets and send to different workers
 * - Reduce the latency cost for small signature sets. In NodeJS 12,14 worker <-> main thread
 *   communiction has very high latency, of around ~5 ms. So package multiple small signature
 *   sets into packages of work and send at once to a worker to distribute the latency cost
 */
class BlsMultiThreadWorkerPool {
    constructor(options, modules) {
        var _a;
        this.jobs = [];
        this.bufferedJobs = null;
        /**
         * Potentially submit jobs to an idle worker, only if there's a worker and jobs
         */
        this.runJob = async () => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            if (this.signal.aborted) {
                return;
            }
            // Find iddle worker
            const worker = this.workers.find((worker) => worker.status.code === WorkerStatusCode.idle);
            if (!worker || worker.status.code !== WorkerStatusCode.idle) {
                return;
            }
            // Prepare work package
            const jobs = this.prepareWork();
            if (jobs.length === 0) {
                return;
            }
            // TODO: After sending the work to the worker the main thread can drop the job arguments
            // and free-up memory, only needs to keep the job's Promise handlers.
            // Maybe it's not useful since all data referenced in jobs is likely referenced by others
            const workerApi = worker.status.workerApi;
            worker.status = { code: WorkerStatusCode.running, workerApi };
            try {
                let startedSigSets = 0;
                for (const job of jobs) {
                    (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.blsThreadPool.jobWaitTime.observe((Date.now() - job.addedTimeMs) / 1000);
                    startedSigSets += job.workReq.sets.length;
                }
                (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.blsThreadPool.totalJobsGroupsStarted.inc(1);
                (_c = this.metrics) === null || _c === void 0 ? void 0 : _c.blsThreadPool.totalJobsStarted.inc(jobs.length);
                (_d = this.metrics) === null || _d === void 0 ? void 0 : _d.blsThreadPool.totalSigSetsStarted.inc(startedSigSets);
                // Send work package to the worker
                // If the job, metrics or any code below throws: the job will reject never going stale.
                // Only downside is the the job promise may be resolved twice, but that's not an issue
                const jobStartNs = process.hrtime.bigint();
                const workResult = await workerApi.verifyManySignatureSets(jobs.map((job) => job.workReq));
                const jobEndNs = process.hrtime.bigint();
                const { workerId, batchRetries, batchSigsSuccess, workerStartNs, workerEndNs, results } = workResult;
                let successCount = 0;
                let errorCount = 0;
                // Un-wrap work package
                for (let i = 0; i < jobs.length; i++) {
                    const job = jobs[i];
                    const jobResult = results[i];
                    const sigSetCount = job.workReq.sets.length;
                    if (!jobResult) {
                        job.reject(Error(`No jobResult for index ${i}`));
                        errorCount += sigSetCount;
                    }
                    else if (jobResult.code === types_1.WorkResultCode.success) {
                        job.resolve(jobResult.result);
                        successCount += sigSetCount;
                    }
                    else {
                        const workerError = Error(jobResult.error.message);
                        if (jobResult.error.stack)
                            workerError.stack = jobResult.error.stack;
                        job.reject(workerError);
                        errorCount += sigSetCount;
                    }
                }
                const workerJobTimeSec = Number(workerEndNs - workerStartNs) / 1e9;
                const latencyToWorkerSec = Number(workerStartNs - jobStartNs) / 1e9;
                const latencyFromWorkerSec = Number(jobEndNs - workerEndNs) / 1e9;
                (_e = this.metrics) === null || _e === void 0 ? void 0 : _e.blsThreadPool.jobsWorkerTime.inc({ workerId }, workerJobTimeSec);
                (_f = this.metrics) === null || _f === void 0 ? void 0 : _f.blsThreadPool.latencyToWorker.observe(latencyToWorkerSec);
                (_g = this.metrics) === null || _g === void 0 ? void 0 : _g.blsThreadPool.latencyFromWorker.observe(latencyFromWorkerSec);
                (_h = this.metrics) === null || _h === void 0 ? void 0 : _h.blsThreadPool.successJobsSignatureSetsCount.inc(successCount);
                (_j = this.metrics) === null || _j === void 0 ? void 0 : _j.blsThreadPool.errorJobsSignatureSetsCount.inc(errorCount);
                (_k = this.metrics) === null || _k === void 0 ? void 0 : _k.blsThreadPool.batchRetries.inc(batchRetries);
                (_l = this.metrics) === null || _l === void 0 ? void 0 : _l.blsThreadPool.batchSigsSuccess.inc(batchSigsSuccess);
            }
            catch (e) {
                // Worker communications should never reject
                if (!this.signal.aborted)
                    this.logger.error("BlsMultiThreadWorkerPool error", {}, e);
                // Reject all
                for (const job of jobs) {
                    job.reject(e);
                }
            }
            worker.status = { code: WorkerStatusCode.idle, workerApi };
            // Potentially run a new job
            setTimeout(this.runJob, 0);
        };
        /**
         * Add all buffered jobs to the job queue and potentially run them immediatelly
         */
        this.runBufferedJobs = () => {
            if (this.bufferedJobs) {
                this.jobs.push(...this.bufferedJobs.jobs);
                this.bufferedJobs = null;
                setTimeout(this.runJob, 0);
            }
        };
        /**
         * Stop all JavaScript execution in the worker thread immediatelly
         */
        this.terminateAllWorkers = () => {
            for (const [id, worker] of this.workers.entries()) {
                // NOTE: 'threads' has not yet updated types, and NodeJS complains with
                // [DEP0132] DeprecationWarning: Passing a callback to worker.terminate() is deprecated. It returns a Promise instead.
                worker.worker.terminate().catch((e) => {
                    if (e)
                        this.logger.error("Error terminating worker", { id }, e);
                });
            }
        };
        this.abortAllJobs = () => {
            while (this.jobs.length > 0) {
                const job = this.jobs.shift();
                if (job)
                    job.reject(new queue_1.QueueError({ code: queue_1.QueueErrorCode.QUEUE_ABORTED }));
            }
        };
        const { logger, metrics, signal } = modules;
        this.logger = logger;
        this.metrics = metrics;
        this.signal = signal;
        this.blsVerifyAllMultiThread = (_a = options.blsVerifyAllMultiThread) !== null && _a !== void 0 ? _a : false;
        // TODO: Allow to customize implementation
        const implementation = bls_1.bls.implementation;
        // Use compressed for herumi for now.
        // THe worker is not able to deserialize from uncompressed
        // `Error: err _wrapDeserialize`
        this.format = implementation === "blst-native" ? bls_1.PointFormat.uncompressed : bls_1.PointFormat.compressed;
        this.workers = this.createWorkers(implementation, (0, utils_1.getDefaultPoolSize)());
        this.signal.addEventListener("abort", () => {
            this.abortAllJobs();
            this.terminateAllWorkers();
            if (this.bufferedJobs)
                clearTimeout(this.bufferedJobs.timeout);
        }, { once: true });
        if (metrics) {
            metrics.blsThreadPool.queueLength.addCollect(() => metrics.blsThreadPool.queueLength.set(this.jobs.length));
        }
    }
    async verifySignatureSets(sets, opts = {}) {
        var _a;
        if (opts.verifyOnMainThread && !this.blsVerifyAllMultiThread) {
            const timer = (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.blsThreadPool.mainThreadDurationInThreadPool.startTimer();
            try {
                return (0, maybeBatch_1.verifySignatureSetsMaybeBatch)(sets.map((set) => ({
                    publicKey: (0, utils_2.getAggregatedPubkey)(set),
                    message: set.signingRoot.valueOf(),
                    signature: set.signature,
                })));
            }
            finally {
                if (timer)
                    timer();
            }
        }
        // Split large array of sets into smaller.
        // Very helpful when syncing finalized, sync may submit +1000 sets so chunkify allows to distribute to many workers
        const results = await Promise.all((0, utils_1.chunkifyMaximizeChunkSize)(sets, MAX_SIGNATURE_SETS_PER_JOB).map((setsWorker) => this.queueBlsWork({
            opts,
            sets: setsWorker.map((s) => ({
                publicKey: (0, utils_2.getAggregatedPubkey)(s).toBytes(this.format),
                message: s.signingRoot.valueOf(),
                signature: s.signature,
            })),
        })));
        // .every on an empty array returns true
        if (results.length === 0) {
            throw Error("Empty results array");
        }
        return results.every((isValid) => isValid === true);
    }
    createWorkers(implementation, poolSize) {
        const workers = [];
        for (let i = 0; i < poolSize; i++) {
            const workerData = { implementation, workerId: i };
            const worker = new threads_1.Worker("./worker", { workerData });
            const workerDescriptor = {
                worker,
                status: { code: WorkerStatusCode.notInitialized },
            };
            workers.push(workerDescriptor);
            // TODO: Consider initializing only when necessary
            const initPromise = (0, threads_1.spawn)(worker, {
                // A Lodestar Node may do very expensive task at start blocking the event loop and causing
                // the initialization to timeout. The number below is big enough to almost disable the timeout
                timeout: 5 * 60 * 1000,
            });
            workerDescriptor.status = { code: WorkerStatusCode.initializing, initPromise };
            initPromise
                .then((workerApi) => {
                workerDescriptor.status = { code: WorkerStatusCode.idle, workerApi };
                // Potentially run jobs that were queued before initialization of the first worker
                setTimeout(this.runJob, 0);
            })
                .catch((error) => {
                workerDescriptor.status = { code: WorkerStatusCode.initializationError, error };
            });
        }
        return workers;
    }
    /**
     * Register BLS work to be done eventually in a worker
     */
    async queueBlsWork(workReq) {
        if (this.signal.aborted) {
            throw new queue_1.QueueError({ code: queue_1.QueueErrorCode.QUEUE_ABORTED });
        }
        // TODO: Consider if limiting queue size is necessary here.
        // It would be bad to reject signatures because the node is slow.
        // However, if the worker communication broke jobs won't ever finish
        if (this.workers.length > 0 &&
            this.workers[0].status.code === WorkerStatusCode.initializationError &&
            this.workers.every((worker) => worker.status.code === WorkerStatusCode.initializationError)) {
            throw this.workers[0].status.error;
        }
        return await new Promise((resolve, reject) => {
            const job = { resolve, reject, addedTimeMs: Date.now(), workReq };
            // Append batchable sets to `bufferedJobs`, starting a timeout to push them into `jobs`.
            // Do not call `runJob()`, it is called from `runBufferedJobs()`
            if (workReq.opts.batchable) {
                if (!this.bufferedJobs) {
                    this.bufferedJobs = {
                        jobs: [],
                        sigCount: 0,
                        firstPush: Date.now(),
                        timeout: setTimeout(this.runBufferedJobs, MAX_BUFFER_WAIT_MS),
                    };
                }
                this.bufferedJobs.jobs.push(job);
                this.bufferedJobs.sigCount += job.workReq.sets.length;
                if (this.bufferedJobs.sigCount > MAX_BUFFERED_SIGS) {
                    clearTimeout(this.bufferedJobs.timeout);
                    this.runBufferedJobs();
                }
            }
            // Push job and schedule to call `runJob` in the next macro event loop cycle.
            // This is usefull to allow batching job submited from a syncronous for loop,
            // and to prevent large stacks since runJob may be called recursively.
            else {
                this.jobs.push(job);
                setTimeout(this.runJob, 0);
            }
        });
    }
    /**
     * Grab pending work up to a max number of signatures
     */
    prepareWork() {
        const jobs = [];
        let totalSigs = 0;
        while (totalSigs < MAX_SIGNATURE_SETS_PER_JOB) {
            const job = this.jobs.shift();
            if (!job) {
                break;
            }
            jobs.push(job);
            totalSigs += job.workReq.sets.length;
        }
        return jobs;
    }
    /** For testing */
    async waitTillInitialized() {
        await Promise.all(this.workers.map(async (worker) => {
            if (worker.status.code === WorkerStatusCode.initializing) {
                await worker.status.initPromise;
            }
        }));
    }
}
exports.BlsMultiThreadWorkerPool = BlsMultiThreadWorkerPool;
//# sourceMappingURL=index.js.map