import { AbortSignal } from "@chainsafe/abort-controller";
import { IExecutionEngine } from "./interface";
import { ExecutionEngineDisabled } from "./disabled";
import { ExecutionEngineHttp, ExecutionEngineHttpOpts } from "./http";
import { ExecutionEngineMock, ExecutionEngineMockOpts } from "./mock";
export { IExecutionEngine, ExecutionEngineHttp, ExecutionEngineDisabled, ExecutionEngineMock };
export declare type ExecutionEngineOpts = ({
    mode?: "http";
} & ExecutionEngineHttpOpts) | ({
    mode: "mock";
} & ExecutionEngineMockOpts) | {
    mode: "disabled";
};
export declare const defaultExecutionEngineOpts: ExecutionEngineOpts;
export declare function initializeExecutionEngine(opts: ExecutionEngineOpts, signal: AbortSignal): IExecutionEngine;
//# sourceMappingURL=index.d.ts.map