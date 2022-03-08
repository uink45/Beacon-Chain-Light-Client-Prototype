/**
 * @module db/controller/impl
 */
import { LevelUp } from "levelup";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IDatabaseController, IDatabaseOptions, IFilterOptions, IKeyValue } from "./interface";
export interface ILevelDBOptions extends IDatabaseOptions {
    db?: LevelUp;
}
/**
 * The LevelDB implementation of DB
 */
export declare class LevelDbController implements IDatabaseController<Uint8Array, Uint8Array> {
    private status;
    private db;
    private opts;
    private logger;
    constructor(opts: ILevelDBOptions, { logger }: {
        logger: ILogger;
    });
    start(): Promise<void>;
    stop(): Promise<void>;
    clear(): Promise<void>;
    get(key: Uint8Array): Promise<Uint8Array | null>;
    put(key: Uint8Array, value: Uint8Array): Promise<void>;
    delete(key: Uint8Array): Promise<void>;
    batchPut(items: IKeyValue<Uint8Array, Uint8Array>[]): Promise<void>;
    batchDelete(keys: Uint8Array[]): Promise<void>;
    keysStream(opts?: IFilterOptions<Uint8Array>): AsyncGenerator<Uint8Array>;
    valuesStream(opts?: IFilterOptions<Uint8Array>): AsyncGenerator<Uint8Array>;
    entriesStream(opts?: IFilterOptions<Uint8Array>): AsyncGenerator<IKeyValue<Uint8Array, Uint8Array>>;
    keys(opts?: IFilterOptions<Uint8Array>): Promise<Uint8Array[]>;
    values(opts?: IFilterOptions<Uint8Array>): Promise<Uint8Array[]>;
    entries(opts?: IFilterOptions<Uint8Array>): Promise<IKeyValue<Uint8Array, Uint8Array>[]>;
    /**
     * Turn an abstract-leveldown iterator into an AsyncGenerator.
     * Replaces https://github.com/Level/iterator-stream
     *
     * How to use:
     * - Entries = { keys: true, values: true }
     * - Keys =    { keys: true, values: false }
     * - Values =  { keys: false, values: true }
     */
    private iterator;
}
//# sourceMappingURL=level.d.ts.map