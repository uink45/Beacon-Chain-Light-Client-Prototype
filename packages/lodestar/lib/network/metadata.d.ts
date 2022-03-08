import { ENR } from "@chainsafe/discv5";
import { BitVector } from "@chainsafe/ssz";
import { ForkName } from "@chainsafe/lodestar-params";
import { altair, Epoch, phase0 } from "@chainsafe/lodestar-types";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IBeaconChain } from "../chain";
export declare enum ENRKey {
    tcp = "tcp",
    eth2 = "eth2",
    attnets = "attnets",
    syncnets = "syncnets"
}
export declare enum SubnetType {
    attnets = "attnets",
    syncnets = "syncnets"
}
export interface IMetadataOpts {
    metadata?: altair.Metadata;
}
export interface IMetadataModules {
    config: IBeaconConfig;
    chain: IBeaconChain;
    logger: ILogger;
}
/**
 * Implementation of eth2 p2p MetaData.
 * For the spec that this code is based on, see:
 * https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/p2p-interface.md#metadata
 */
export declare class MetadataController {
    private enr?;
    private config;
    private chain;
    private _metadata;
    private logger;
    constructor(opts: IMetadataOpts, modules: IMetadataModules);
    start(enr: ENR | undefined, currentFork: ForkName): void;
    get seqNumber(): bigint;
    get syncnets(): BitVector;
    set syncnets(syncnets: BitVector);
    get attnets(): BitVector;
    set attnets(attnets: BitVector);
    /** Consumers that need the phase0.Metadata type can just ignore the .syncnets property */
    get json(): altair.Metadata;
    /**
     * From spec:
     *   fork_digest is compute_fork_digest(current_fork_version, genesis_validators_root) where
     *   - current_fork_version is the fork version at the node's current epoch defined by the wall-clock time (not
     *     necessarily the epoch to which the node is sync)
     *   - genesis_validators_root is the static Root found in state.genesis_validators_root
     *
     * 1. MUST be called on start to populate ENR
     * 2. Network MUST call this method on fork transition.
     *    Current Clock implementation ensures no race conditions, epoch is correct if re-fetched
     */
    updateEth2Field(epoch: Epoch): void;
}
export declare function getENRForkID(config: IBeaconConfig, clockEpoch: Epoch): phase0.ENRForkID;
//# sourceMappingURL=metadata.d.ts.map