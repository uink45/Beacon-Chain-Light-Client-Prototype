"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobItemQueue = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const array_1 = require("../array");
const errors_1 = require("./errors");
const options_1 = require("./options");
/**
 * JobQueue that stores arguments in the job array instead of closures.
 * Supports a single itemProcessor, for arbitrary functions use the JobFnQueue
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class JobItemQueue {
    constructor(itemProcessor, opts, metrics) {
        this.itemProcessor = itemProcessor;
        /**
         * We choose to use LinkedList instead of regular array to improve shift() / push() / pop() performance.
         * See the LinkedList benchmark for more details.
         * */
        this.jobs = new array_1.LinkedList();
        this.runningJobs = 0;
        this.lastYield = 0;
        this.dropAllJobs = () => {
            this.jobs.clear();
        };
        this.runJob = async () => {
            var _a, _b;
            if (this.opts.signal.aborted || this.runningJobs >= this.opts.maxConcurrency) {
                return;
            }
            // Default to FIFO. LIFO -> pop() remove last item, FIFO -> shift() remove first item
            const job = this.opts.type === options_1.QueueType.LIFO ? this.jobs.pop() : this.jobs.shift();
            if (!job) {
                return;
            }
            this.runningJobs++;
            // If the job, metrics or any code below throws: the job will reject never going stale.
            // Only downside is the the job promise may be resolved twice, but that's not an issue
            try {
                const timer = (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.jobTime.startTimer();
                (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.jobWaitTime.observe((Date.now() - job.addedTimeMs) / 1000);
                const result = await this.itemProcessor(...job.args);
                job.resolve(result);
                if (timer)
                    timer();
                // Yield to the macro queue
                if (Date.now() - this.lastYield > this.opts.yieldEveryMs) {
                    this.lastYield = Date.now();
                    await (0, lodestar_utils_1.sleep)(0);
                }
            }
            catch (e) {
                job.reject(e);
            }
            this.runningJobs = Math.max(0, this.runningJobs - 1);
            // Potentially run a new job
            void this.runJob();
        };
        this.abortAllJobs = () => {
            while (this.jobs.length > 0) {
                const job = this.jobs.pop();
                if (job)
                    job.reject(new errors_1.QueueError({ code: errors_1.QueueErrorCode.QUEUE_ABORTED }));
            }
        };
        this.opts = { ...options_1.defaultQueueOpts, ...opts };
        this.opts.signal.addEventListener("abort", this.abortAllJobs, { once: true });
        if (metrics) {
            this.metrics = metrics;
            metrics.length.addCollect(() => metrics.length.set(this.jobs.length));
        }
    }
    push(...args) {
        var _a;
        if (this.opts.signal.aborted) {
            throw new errors_1.QueueError({ code: errors_1.QueueErrorCode.QUEUE_ABORTED });
        }
        if (this.jobs.length + 1 > this.opts.maxLength) {
            (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.droppedJobs.inc();
            if (this.opts.type === options_1.QueueType.LIFO) {
                // In LIFO queues keep the latest job and drop the oldest
                this.jobs.shift();
            }
            else {
                // In FIFO queues drop the latest job
                throw new errors_1.QueueError({ code: errors_1.QueueErrorCode.QUEUE_MAX_LENGTH });
            }
        }
        return new Promise((resolve, reject) => {
            this.jobs.push({ args, resolve, reject, addedTimeMs: Date.now() });
            if (this.runningJobs < this.opts.maxConcurrency) {
                setTimeout(this.runJob, 0);
            }
        });
    }
    getItems() {
        return this.jobs.map((job) => ({ args: job.args, addedTimeMs: job.addedTimeMs }));
    }
}
exports.JobItemQueue = JobItemQueue;
//# sourceMappingURL=itemQueue.js.map