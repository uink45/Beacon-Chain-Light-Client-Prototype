import { AbortSignal } from "@chainsafe/abort-controller";
import { Genesis } from "@chainsafe/lodestar-types/phase0";
import { ILogger } from "@chainsafe/lodestar-utils";
import { Api } from "@chainsafe/lodestar-api";
export declare function waitForGenesis(api: Api, logger: ILogger, signal?: AbortSignal): Promise<Genesis>;
//# sourceMappingURL=genesis.d.ts.map