import { IExecutionEngine } from "./interface";
export declare class ExecutionEngineDisabled implements IExecutionEngine {
    notifyNewPayload(): Promise<never>;
    notifyForkchoiceUpdate(): Promise<never>;
    getPayload(): Promise<never>;
}
//# sourceMappingURL=disabled.d.ts.map