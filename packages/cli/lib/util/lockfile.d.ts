declare type Lockfile = {
    lockSync(path: string): void;
    unlockSync(path: string): void;
};
/**
 * When lockfile it's required it registers listeners to process
 * Since it's only used by the validator client, require lazily to not pollute
 * beacon_node client context
 */
export declare function getLockFile(): Lockfile;
export {};
//# sourceMappingURL=lockfile.d.ts.map