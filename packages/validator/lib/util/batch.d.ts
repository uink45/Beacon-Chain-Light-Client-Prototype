/**
 * Divide pubkeys into batches, each batch contains at most 5 http requests,
 * each request can work on at most 40 pubkeys.
 */
export declare function batchItems<T>(items: T[], opts: {
    batchSize: number;
    maxBatches?: number;
}): T[][];
//# sourceMappingURL=batch.d.ts.map