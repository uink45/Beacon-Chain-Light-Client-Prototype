import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { ArrayLike, Type } from "@chainsafe/ssz";
import { IFilterOptions, IKeyValue } from "./controller";
import { Db } from "./controller/interface";
import { DbMetricCounter, IDbMetrics } from "./metrics";
import { Bucket } from "./schema";
export declare type Id = Uint8Array | string | number | bigint;
/**
 * Repository is a high level kv storage
 * managing a Uint8rray to Uint8rray kv database
 * It translates typed keys and values to Uint8rrays required by the underlying database
 *
 * By default, SSZ-encoded values,
 * indexed by root
 */
export declare abstract class Repository<I extends Id, T> {
    protected config: IChainForkConfig;
    protected db: Db;
    protected bucket: Bucket;
    protected type: Type<T>;
    protected dbReadsMetrics?: ReturnType<DbMetricCounter["labels"]>;
    protected dbWriteMetrics?: ReturnType<DbMetricCounter["labels"]>;
    protected constructor(config: IChainForkConfig, db: Db, bucket: Bucket, type: Type<T>, metrics?: IDbMetrics);
    encodeValue(value: T): Uint8Array;
    decodeValue(data: Uint8Array): T;
    encodeKey(id: I): Uint8Array;
    decodeKey(key: Uint8Array): I;
    get(id: I): Promise<T | null>;
    getBinary(id: I): Promise<Uint8Array | null>;
    has(id: I): Promise<boolean>;
    put(id: I, value: T): Promise<void>;
    putBinary(id: I, value: Uint8Array): Promise<void>;
    delete(id: I): Promise<void>;
    getId(value: T): I;
    add(value: T): Promise<void>;
    remove(value: T): Promise<void>;
    batchPut(items: ArrayLike<IKeyValue<I, T>>): Promise<void>;
    batchPutBinary(items: ArrayLike<IKeyValue<I, Uint8Array>>): Promise<void>;
    batchDelete(ids: ArrayLike<I>): Promise<void>;
    batchAdd(values: ArrayLike<T>): Promise<void>;
    batchRemove(values: ArrayLike<T>): Promise<void>;
    keys(opts?: IFilterOptions<I>): Promise<I[]>;
    keysStream(opts?: IFilterOptions<I>): AsyncIterable<I>;
    values(opts?: IFilterOptions<I>): Promise<T[]>;
    valuesStream(opts?: IFilterOptions<I>): AsyncIterable<T>;
    binaryEntriesStream(opts?: IFilterOptions<I>): AsyncIterable<IKeyValue<Uint8Array, Uint8Array>>;
    entries(opts?: IFilterOptions<I>): Promise<IKeyValue<I, T>[]>;
    entriesStream(opts?: IFilterOptions<I>): AsyncIterable<IKeyValue<I, T>>;
    firstKey(): Promise<I | null>;
    lastKey(): Promise<I | null>;
    firstValue(): Promise<T | null>;
    lastValue(): Promise<T | null>;
    firstEntry(): Promise<IKeyValue<I, T> | null>;
    lastEntry(): Promise<IKeyValue<I, T> | null>;
    /**
     * Transforms opts from I to Uint8Array
     */
    protected dbFilterOptions(opts?: IFilterOptions<I>): IFilterOptions<Uint8Array>;
}
//# sourceMappingURL=abstractRepository.d.ts.map