import { AbortSignal } from "@chainsafe/abort-controller";
/**
 * Abortable sleep function. Cleans everything on all cases preventing leaks
 * On abort throws ErrorAborted
 */
export declare function sleep(ms: number, signal?: AbortSignal): Promise<void>;
//# sourceMappingURL=sleep.d.ts.map