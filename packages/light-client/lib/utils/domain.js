"use strict";
// Only used by processDeposit +  lightclient
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSigningRoot = exports.computeForkDataRoot = exports.getForkVersion = exports.computeDomain = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
/**
 * Return the domain for the [[domainType]] and [[forkVersion]].
 */
function computeDomain(domainType, forkVersion, genesisValidatorRoot) {
    const forkDataRoot = computeForkDataRoot(forkVersion, genesisValidatorRoot);
    const domain = new Uint8Array(32);
    domain.set(domainType, 0);
    domain.set(forkDataRoot.slice(0, 28), 4);
    return domain;
}
exports.computeDomain = computeDomain;
/**
 * Return the ForkVersion at an epoch from a Fork type
 */
function getForkVersion(fork, epoch) {
    return epoch < fork.epoch ? fork.previousVersion : fork.currentVersion;
}
exports.getForkVersion = getForkVersion;
/**
 * Used primarily in signature domains to avoid collisions across forks/chains.
 */
function computeForkDataRoot(currentVersion, genesisValidatorsRoot) {
    const forkData = {
        currentVersion,
        genesisValidatorsRoot,
    };
    return lodestar_types_1.ssz.phase0.ForkData.hashTreeRoot(forkData);
}
exports.computeForkDataRoot = computeForkDataRoot;
/**
 * Return the signing root of an object by calculating the root of the object-domain tree.
 */
function computeSigningRoot(type, sszObject, domain) {
    const domainWrappedObject = {
        objectRoot: type.hashTreeRoot(sszObject),
        domain,
    };
    return lodestar_types_1.ssz.phase0.SigningData.hashTreeRoot(domainWrappedObject);
}
exports.computeSigningRoot = computeSigningRoot;
//# sourceMappingURL=domain.js.map