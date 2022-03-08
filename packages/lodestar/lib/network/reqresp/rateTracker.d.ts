import { MapDef } from "../../util/map";
declare type RateTrackerOpts = {
    limit: number;
    timeoutMs: number;
};
/**
 * The generic rate tracker allows up to `limit` objects in a period of time.
 * This could apply to both request count or block count, for both requests and responses.
 */
export declare class RateTracker {
    private requestsWithinWindow;
    private limit;
    private timeoutMs;
    /** Key as time in second and value as object requested */
    private requests;
    constructor(opts: RateTrackerOpts, requests?: MapDef<number, number>);
    requestObjects(objectCount: number): number;
    getRequestedObjectsWithinWindow(): number;
    private prune;
}
export {};
//# sourceMappingURL=rateTracker.d.ts.map