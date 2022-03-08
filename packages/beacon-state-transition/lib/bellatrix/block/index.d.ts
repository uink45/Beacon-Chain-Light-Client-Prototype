import { bellatrix } from "@chainsafe/lodestar-types";
import { CachedBeaconStateBellatrix } from "../../types";
import { processOperations } from "./processOperations";
import { ExecutionEngine } from "../executionEngine";
import { processAttesterSlashing } from "./processAttesterSlashing";
import { processProposerSlashing } from "./processProposerSlashing";
export { processOperations, processAttesterSlashing, processProposerSlashing };
export declare function processBlock(state: CachedBeaconStateBellatrix, block: bellatrix.BeaconBlock, verifySignatures: boolean | undefined, executionEngine: ExecutionEngine | null): void;
//# sourceMappingURL=index.d.ts.map