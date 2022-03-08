"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInterchangeCompleteV4 = exports.serializeInterchangeCompleteV4 = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const ssz_1 = require("@chainsafe/ssz");
const utils_1 = require("../../utils");
function serializeInterchangeCompleteV4({ data, genesisValidatorsRoot, }) {
    return {
        metadata: {
            interchange_format: "complete",
            interchange_format_version: "4",
            genesis_validators_root: (0, ssz_1.toHexString)(genesisValidatorsRoot),
        },
        data: data.map((validator) => ({
            pubkey: (0, ssz_1.toHexString)(validator.pubkey),
            signed_blocks: validator.signedBlocks.map((block) => ({
                slot: (0, utils_1.numToString)(block.slot),
                signing_root: (0, utils_1.toOptionalHexString)(block.signingRoot),
            })),
            signed_attestations: validator.signedAttestations.map((att) => ({
                source_epoch: (0, utils_1.numToString)(att.sourceEpoch),
                target_epoch: (0, utils_1.numToString)(att.targetEpoch),
                signing_root: (0, utils_1.toOptionalHexString)(att.signingRoot),
            })),
        })),
    };
}
exports.serializeInterchangeCompleteV4 = serializeInterchangeCompleteV4;
function parseInterchangeCompleteV4(interchange) {
    return {
        genesisValidatorsRoot: (0, ssz_1.fromHexString)(interchange.metadata.genesis_validators_root),
        data: interchange.data.map((validator) => ({
            pubkey: (0, ssz_1.fromHexString)(validator.pubkey),
            signedBlocks: validator.signed_blocks.map((block) => ({
                slot: parseInt(block.slot, 10),
                signingRoot: (0, utils_1.fromOptionalHexString)(block.signing_root),
            })),
            signedAttestations: validator.signed_attestations.map((att) => ({
                sourceEpoch: parseInt(att.source_epoch, 10),
                targetEpoch: parseInt(att.target_epoch, 10),
                signingRoot: (0, utils_1.fromOptionalHexString)(att.signing_root),
            })),
        })),
    };
}
exports.parseInterchangeCompleteV4 = parseInterchangeCompleteV4;
//# sourceMappingURL=completeV4.js.map