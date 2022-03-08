import { Epoch, Root, Slot } from "@chainsafe/lodestar-types";
export interface SlashingProtectionBlock {
    slot: Slot;
    signingRoot: Root;
}
export interface SlashingProtectionAttestation {
    sourceEpoch: Epoch;
    targetEpoch: Epoch;
    signingRoot: Root;
}
//# sourceMappingURL=types.d.ts.map