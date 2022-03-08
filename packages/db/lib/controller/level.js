"use strict";
/**
 * @module db/controller/impl
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelDbController = void 0;
const level_1 = __importDefault(require("level"));
const it_all_1 = __importDefault(require("it-all"));
var Status;
(function (Status) {
    Status["started"] = "started";
    Status["stopped"] = "stopped";
})(Status || (Status = {}));
/**
 * The LevelDB implementation of DB
 */
class LevelDbController {
    constructor(opts, { logger }) {
        this.status = Status.stopped;
        this.opts = opts;
        this.logger = logger;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        this.db = opts.db || (0, level_1.default)(opts.name || "beaconchain", { keyEncoding: "binary", valueEncoding: "binary" });
    }
    async start() {
        if (this.status === Status.started)
            return;
        this.status = Status.started;
        await this.db.open();
        this.logger.info("Connected to LevelDB database", { name: this.opts.name });
    }
    async stop() {
        if (this.status === Status.stopped)
            return;
        this.status = Status.stopped;
        await this.db.close();
    }
    async clear() {
        await this.db.clear();
    }
    async get(key) {
        try {
            return (await this.db.get(key));
        }
        catch (e) {
            if (e.notFound) {
                return null;
            }
            throw e;
        }
    }
    async put(key, value) {
        await this.db.put(key, value);
    }
    async delete(key) {
        await this.db.del(key);
    }
    async batchPut(items) {
        const batch = this.db.batch();
        for (const item of items)
            batch.put(item.key, item.value);
        await batch.write();
    }
    async batchDelete(keys) {
        const batch = this.db.batch();
        for (const key of keys)
            batch.del(key);
        await batch.write();
    }
    keysStream(opts) {
        return this.iterator({ keys: true, values: false }, (key) => key, opts);
    }
    valuesStream(opts) {
        return this.iterator({ keys: false, values: true }, (_key, value) => value, opts);
    }
    entriesStream(opts) {
        return this.iterator({ keys: true, values: true }, (key, value) => ({ key, value }), opts);
    }
    async keys(opts) {
        return (0, it_all_1.default)(this.keysStream(opts));
    }
    async values(opts) {
        return (0, it_all_1.default)(this.valuesStream(opts));
    }
    async entries(opts) {
        return (0, it_all_1.default)(this.entriesStream(opts));
    }
    /**
     * Turn an abstract-leveldown iterator into an AsyncGenerator.
     * Replaces https://github.com/Level/iterator-stream
     *
     * How to use:
     * - Entries = { keys: true, values: true }
     * - Keys =    { keys: true, values: false }
     * - Values =  { keys: false, values: true }
     */
    async *iterator(keysOpts, getValue, opts) {
        // Entries = { keys: true, values: true }
        // Keys =    { keys: true, values: false }
        // Values =  { keys: false, values: true }
        var _a;
        const iterator = this.db.iterator({
            ...opts,
            ...keysOpts,
            // TODO: Test if this is necessary. It's in https://github.com/Level/iterator-stream but may be stale
            limit: (_a = opts === null || opts === void 0 ? void 0 : opts.limit) !== null && _a !== void 0 ? _a : -1,
        });
        try {
            while (true) {
                const [key, value] = await new Promise((resolve, reject) => {
                    iterator.next((err, key, value) => {
                        if (err)
                            reject(err);
                        else
                            resolve([key, value]);
                    });
                });
                // Source code justification of why this condition implies the stream is done
                // https://github.com/Level/level-js/blob/e2253839a62fa969de50e9114279763228959d40/iterator.js#L123
                if (key === undefined && value === undefined) {
                    return; // Done
                }
                yield getValue(key, value);
            }
        }
        finally {
            // TODO: Should we await here?
            await new Promise((resolve, reject) => {
                iterator.end((err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        }
    }
}
exports.LevelDbController = LevelDbController;
//# sourceMappingURL=level.js.map