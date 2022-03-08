/**
 * @module chain/blockAssembly
 */
import { Bytes96, Bytes32, allForks, Root, Slot, ExecutionAddress } from "@chainsafe/lodestar-types";
import { CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { IBeaconChain } from "../../interface";
export declare function assembleBody(chain: IBeaconChain, currentState: CachedBeaconStateAllForks, { randaoReveal, graffiti, blockSlot, parentSlot, parentBlockRoot, feeRecipient, }: {
    randaoReveal: Bytes96;
    graffiti: Bytes32;
    blockSlot: Slot;
    parentSlot: Slot;
    parentBlockRoot: Root;
    feeRecipient: ExecutionAddress;
}): Promise<allForks.BeaconBlockBody>;
/** process_sync_committee_contributions is implemented in syncCommitteeContribution.getSyncAggregate */
//# sourceMappingURL=body.d.ts.map