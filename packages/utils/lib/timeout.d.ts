import { AbortSignal } from "@chainsafe/abort-controller";
export declare function withTimeout<T>(asyncFn: (timeoutAndParentSignal?: AbortSignal) => Promise<T>, timeoutMs: number, signal?: AbortSignal): Promise<T>;
//# sourceMappingURL=timeout.d.ts.map