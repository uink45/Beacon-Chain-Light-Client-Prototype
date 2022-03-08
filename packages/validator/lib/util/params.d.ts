import { IChainConfig } from "@chainsafe/lodestar-config";
export declare class NotEqualParamsError extends Error {
}
/**
 * Assert localConfig values match externalSpecJson. externalSpecJson may contain more values than localConfig.
 */
export declare function assertEqualParams(localConfig: IChainConfig, externalSpecJson: Record<string, string>): void;
//# sourceMappingURL=params.d.ts.map