import { phase0 } from "@chainsafe/lodestar-types";
import { CachedBeaconStatePhase0 } from "../../types";
import { processOperations } from "./processOperations";
import { processAttestation, validateAttestation } from "./processAttestation";
import { processDeposit } from "./processDeposit";
import { processAttesterSlashing } from "./processAttesterSlashing";
import { processProposerSlashing } from "./processProposerSlashing";
import { processVoluntaryExit } from "./processVoluntaryExit";
export { isValidIndexedAttestation } from "../../allForks/block";
export { processOperations, validateAttestation, processAttestation, processDeposit, processAttesterSlashing, processProposerSlashing, processVoluntaryExit, };
export declare function processBlock(state: CachedBeaconStatePhase0, block: phase0.BeaconBlock, verifySignatures?: boolean): void;
//# sourceMappingURL=index.d.ts.map