import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IMetrics } from "../../../metrics";
import { IBeaconChain } from "../../../chain";
import { GossipHandlers } from "../interface";
import { INetwork } from "../../interface";
/**
 * Gossip handler options as part of network options
 */
export declare type GossipHandlerOpts = {
    dontSendGossipAttestationsToForkchoice: boolean;
};
/**
 * By default:
 * + pass gossip attestations to forkchoice
 */
export declare const defaultGossipHandlerOpts: {
    dontSendGossipAttestationsToForkchoice: boolean;
};
declare type ValidatorFnsModules = {
    chain: IBeaconChain;
    config: IBeaconConfig;
    logger: ILogger;
    network: INetwork;
    metrics: IMetrics | null;
};
/**
 * Gossip handlers perform validation + handling in a single function.
 * - This gossip handlers MUST only be registered as validator functions. No handler is registered for any topic.
 * - All `chain/validation/*` functions MUST throw typed GossipActionError instances so they gossip action is captured
 *   by `getGossipValidatorFn()` try catch block.
 * - This gossip handlers should not let any handling errors propagate to the caller. Only validation errors must be thrown.
 *
 * Note: `libp2p/js-libp2p-interfaces` would normally indicate to register separate validator functions and handler functions.
 * This approach is not suitable for us because:
 * - We do expensive processing on the object in the validator function that we need to re-use in the handler function.
 * - The validator function produces extra data that is needed for the handler function. Making this data available in
 *   the handler function scope is hard to achieve without very hacky strategies
 * - Eth2.0 gossipsub protocol strictly defined a single topic for message
 */
export declare function getGossipHandlers(modules: ValidatorFnsModules, options: GossipHandlerOpts): GossipHandlers;
export {};
//# sourceMappingURL=index.d.ts.map