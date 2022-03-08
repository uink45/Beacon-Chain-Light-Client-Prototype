/**
 * Joins multiple url parts safely
 * - Does not break the protocol double slash //
 * - Cleans double slashes at any point
 * @param args ("http://localhost/", "/node/", "/genesis_time")
 * @return "http://localhost/node/genesis_time"
 */
export declare function urlJoin(...args: string[]): string;
//# sourceMappingURL=url.d.ts.map