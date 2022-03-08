"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const _1 = require(".");
const schema_1 = require("./schema");
const util_1 = require("./util");
/**
 * Repository is a high level kv storage
 * managing a Uint8rray to Uint8rray kv database
 * It translates typed keys and values to Uint8rrays required by the underlying database
 *
 * By default, SSZ-encoded values,
 * indexed by root
 */
class Repository {
    constructor(config, db, bucket, type, metrics) {
        this.config = config;
        this.db = db;
        this.bucket = bucket;
        this.type = type;
        this.dbReadsMetrics = metrics === null || metrics === void 0 ? void 0 : metrics.dbReads.labels({ bucket: (0, util_1.getBucketNameByValue)(bucket) });
        this.dbWriteMetrics = metrics === null || metrics === void 0 ? void 0 : metrics.dbWrites.labels({ bucket: (0, util_1.getBucketNameByValue)(bucket) });
    }
    encodeValue(value) {
        return this.type.serialize(value);
    }
    decodeValue(data) {
        return this.type.deserialize(data);
    }
    encodeKey(id) {
        return (0, schema_1.encodeKey)(this.bucket, id);
    }
    decodeKey(key) {
        return key.slice(_1.BUCKET_LENGTH);
    }
    async get(id) {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const value = await this.db.get(this.encodeKey(id));
        if (!value)
            return null;
        return this.decodeValue(value);
    }
    async getBinary(id) {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const value = await this.db.get(this.encodeKey(id));
        if (!value)
            return null;
        return value;
    }
    async has(id) {
        return (await this.get(id)) !== null;
    }
    async put(id, value) {
        var _a;
        (_a = this.dbWriteMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        await this.db.put(this.encodeKey(id), this.encodeValue(value));
    }
    async putBinary(id, value) {
        var _a;
        (_a = this.dbWriteMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        await this.db.put(this.encodeKey(id), value);
    }
    async delete(id) {
        var _a;
        (_a = this.dbWriteMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        await this.db.delete(this.encodeKey(id));
    }
    // The Id can be inferred from the value
    getId(value) {
        return this.type.hashTreeRoot(value);
    }
    async add(value) {
        await this.put(this.getId(value), value);
    }
    async remove(value) {
        await this.delete(this.getId(value));
    }
    async batchPut(items) {
        var _a;
        (_a = this.dbWriteMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        await this.db.batchPut(Array.from({ length: items.length }, (_, i) => ({
            key: this.encodeKey(items[i].key),
            value: this.encodeValue(items[i].value),
        })));
    }
    // Similar to batchPut but we support value as Uint8Array
    async batchPutBinary(items) {
        var _a;
        (_a = this.dbWriteMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        await this.db.batchPut(Array.from({ length: items.length }, (_, i) => ({
            key: this.encodeKey(items[i].key),
            value: items[i].value,
        })));
    }
    async batchDelete(ids) {
        var _a;
        (_a = this.dbWriteMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        await this.db.batchDelete(Array.from({ length: ids.length }, (_, i) => this.encodeKey(ids[i])));
    }
    async batchAdd(values) {
        await this.batchPut(Array.from({ length: values.length }, (_, i) => ({
            key: this.getId(values[i]),
            value: values[i],
        })));
    }
    async batchRemove(values) {
        await this.batchDelete(Array.from({ length: values.length }, (ignored, i) => this.getId(values[i])));
    }
    async keys(opts) {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const data = await this.db.keys(this.dbFilterOptions(opts));
        return (data !== null && data !== void 0 ? data : []).map((data) => this.decodeKey(data));
    }
    async *keysStream(opts) {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const keysStream = this.db.keysStream(this.dbFilterOptions(opts));
        const decodeKey = this.decodeKey.bind(this);
        for await (const key of keysStream) {
            yield decodeKey(key);
        }
    }
    async values(opts) {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const data = await this.db.values(this.dbFilterOptions(opts));
        return (data !== null && data !== void 0 ? data : []).map((data) => this.decodeValue(data));
    }
    async *valuesStream(opts) {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const valuesStream = this.db.valuesStream(this.dbFilterOptions(opts));
        const decodeValue = this.decodeValue.bind(this);
        for await (const value of valuesStream) {
            yield decodeValue(value);
        }
    }
    async *binaryEntriesStream(opts) {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        yield* this.db.entriesStream(this.dbFilterOptions(opts));
    }
    async entries(opts) {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const data = await this.db.entries(this.dbFilterOptions(opts));
        return (data !== null && data !== void 0 ? data : []).map((data) => ({
            key: this.decodeKey(data.key),
            value: this.decodeValue(data.value),
        }));
    }
    async *entriesStream(opts) {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const entriesStream = this.db.entriesStream(this.dbFilterOptions(opts));
        const decodeKey = this.decodeKey.bind(this);
        const decodeValue = this.decodeValue.bind(this);
        for await (const entry of entriesStream) {
            yield {
                key: decodeKey(entry.key),
                value: decodeValue(entry.value),
            };
        }
    }
    async firstKey() {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const keys = await this.keys({ limit: 1 });
        if (!keys.length) {
            return null;
        }
        return keys[0];
    }
    async lastKey() {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const keys = await this.keys({ limit: 1, reverse: true });
        if (!keys.length) {
            return null;
        }
        return keys[0];
    }
    async firstValue() {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const values = await this.values({ limit: 1 });
        if (!values.length) {
            return null;
        }
        return values[0];
    }
    async lastValue() {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const values = await this.values({ limit: 1, reverse: true });
        if (!values.length) {
            return null;
        }
        return values[0];
    }
    async firstEntry() {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const entries = await this.entries({ limit: 1 });
        if (!entries.length) {
            return null;
        }
        return entries[0];
    }
    async lastEntry() {
        var _a;
        (_a = this.dbReadsMetrics) === null || _a === void 0 ? void 0 : _a.inc();
        const entries = await this.entries({ limit: 1, reverse: true });
        if (!entries.length) {
            return null;
        }
        return entries[0];
    }
    /**
     * Transforms opts from I to Uint8Array
     */
    dbFilterOptions(opts) {
        const _opts = {
            gte: (0, schema_1.encodeKey)(this.bucket, Buffer.alloc(0)),
            lt: (0, schema_1.encodeKey)(this.bucket + 1, Buffer.alloc(0)),
        };
        if (opts) {
            if (opts.lt !== undefined) {
                _opts.lt = this.encodeKey(opts.lt);
            }
            else if (opts.lte !== undefined) {
                delete _opts.lt;
                _opts.lte = this.encodeKey(opts.lte);
            }
            if (opts.gt !== undefined) {
                delete _opts.gte;
                _opts.gt = this.encodeKey(opts.gt);
            }
            else if (opts.gte !== undefined) {
                _opts.gte = this.encodeKey(opts.gte);
            }
            _opts.reverse = opts.reverse;
            _opts.limit = opts.limit;
        }
        return _opts;
    }
}
exports.Repository = Repository;
//# sourceMappingURL=abstractRepository.js.map