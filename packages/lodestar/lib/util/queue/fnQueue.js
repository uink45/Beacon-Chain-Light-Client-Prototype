"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobFnQueue = void 0;
const itemQueue_1 = require("./itemQueue");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class JobFnQueue extends itemQueue_1.JobItemQueue {
    constructor(opts, metrics) {
        super((fn) => fn(), opts, metrics);
    }
    push(fn) {
        return super.push(fn);
    }
}
exports.JobFnQueue = JobFnQueue;
//# sourceMappingURL=fnQueue.js.map