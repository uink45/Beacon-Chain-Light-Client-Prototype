"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSigningRoot = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
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
//# sourceMappingURL=signingRoot.js.map