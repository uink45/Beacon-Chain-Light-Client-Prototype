/**
 * @module chain/stateTransition/util
 */
import { Epoch, Version, Root, DomainType, allForks } from "@chainsafe/lodestar-types";
/**
 * Return the domain for the [[domainType]] and [[forkVersion]].
 */
export declare function computeDomain(domainType: DomainType, forkVersion: Version, genesisValidatorRoot: Root): Uint8Array;
/**
 * Return the ForkVersion at an epoch from a Fork type
 */
export declare function getForkVersion(fork: allForks.BeaconState["fork"], epoch: Epoch): Version;
/**
 * Used primarily in signature domains to avoid collisions across forks/chains.
 */
export declare function computeForkDataRoot(currentVersion: Version, genesisValidatorsRoot: Root): Uint8Array;
//# sourceMappingURL=domain.d.ts.map