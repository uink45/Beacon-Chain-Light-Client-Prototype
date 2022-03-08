import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { ILogger } from "@chainsafe/lodestar-utils";
import { AbortSignal } from "@chainsafe/abort-controller";
import { IBeaconChain } from "../chain";
import { INetwork } from "../network";
import { IBeaconSync } from "../sync";
/**
 * Runs a notifier service that periodically logs information about the node.
 */
export declare function runNodeNotifier({ network, chain, sync, config, logger, signal, }: {
    network: INetwork;
    chain: IBeaconChain;
    sync: IBeaconSync;
    config: IBeaconConfig;
    logger: ILogger;
    signal: AbortSignal;
}): Promise<void>;
//# sourceMappingURL=notifier.d.ts.map