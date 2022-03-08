"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultQueueOpts = exports.QueueType = void 0;
var QueueType;
(function (QueueType) {
    QueueType["FIFO"] = "FIFO";
    QueueType["LIFO"] = "LIFO";
})(QueueType = exports.QueueType || (exports.QueueType = {}));
exports.defaultQueueOpts = {
    maxConcurrency: 1,
    yieldEveryMs: 50,
    type: QueueType.FIFO,
};
//# sourceMappingURL=options.js.map