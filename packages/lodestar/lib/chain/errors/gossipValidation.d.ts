import { LodestarError } from "@chainsafe/lodestar-utils";
import { PeerAction } from "../../network";
export declare enum GossipAction {
    IGNORE = "IGNORE",
    REJECT = "REJECT"
}
export declare class GossipActionError<T extends {
    code: string;
}> extends LodestarError<T> {
    /** The action at gossipsub side */
    action: GossipAction;
    /** The action at node side */
    lodestarAction: PeerAction | null;
    constructor(action: GossipAction, lodestarAction: PeerAction | null, type: T);
}
//# sourceMappingURL=gossipValidation.d.ts.map