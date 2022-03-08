"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashingProtection = exports.InterchangeErrorErrorCode = exports.InterchangeError = exports.InvalidBlockErrorCode = exports.InvalidBlockError = exports.InvalidAttestationErrorCode = exports.InvalidAttestationError = void 0;
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const utils_1 = require("../slashingProtection/utils");
const block_1 = require("./block");
const attestation_1 = require("./attestation");
const interchange_1 = require("./interchange");
const minMaxSurround_1 = require("./minMaxSurround");
var attestation_2 = require("./attestation");
Object.defineProperty(exports, "InvalidAttestationError", { enumerable: true, get: function () { return attestation_2.InvalidAttestationError; } });
Object.defineProperty(exports, "InvalidAttestationErrorCode", { enumerable: true, get: function () { return attestation_2.InvalidAttestationErrorCode; } });
var block_2 = require("./block");
Object.defineProperty(exports, "InvalidBlockError", { enumerable: true, get: function () { return block_2.InvalidBlockError; } });
Object.defineProperty(exports, "InvalidBlockErrorCode", { enumerable: true, get: function () { return block_2.InvalidBlockErrorCode; } });
var interchange_2 = require("./interchange");
Object.defineProperty(exports, "InterchangeError", { enumerable: true, get: function () { return interchange_2.InterchangeError; } });
Object.defineProperty(exports, "InterchangeErrorErrorCode", { enumerable: true, get: function () { return interchange_2.InterchangeErrorErrorCode; } });
/**
 * Handles slashing protection for validator proposer and attester duties as well as slashing protection
 * during a validator interchange import/export process.
 */
class SlashingProtection extends lodestar_db_1.DatabaseService {
    constructor(opts) {
        super(opts);
        const blockBySlotRepository = new block_1.BlockBySlotRepository(opts);
        const attestationByTargetRepository = new attestation_1.AttestationByTargetRepository(opts);
        const attestationLowerBoundRepository = new attestation_1.AttestationLowerBoundRepository(opts);
        const distanceStoreRepository = new minMaxSurround_1.DistanceStoreRepository(opts);
        const minMaxSurround = new minMaxSurround_1.MinMaxSurround(distanceStoreRepository);
        this.blockService = new block_1.SlashingProtectionBlockService(blockBySlotRepository);
        this.attestationService = new attestation_1.SlashingProtectionAttestationService(attestationByTargetRepository, attestationLowerBoundRepository, minMaxSurround);
    }
    async checkAndInsertBlockProposal(pubKey, block) {
        await this.blockService.checkAndInsertBlockProposal(pubKey, block);
    }
    async checkAndInsertAttestation(pubKey, attestation) {
        await this.attestationService.checkAndInsertAttestation(pubKey, attestation);
    }
    async importInterchange(interchange, genesisValidatorsRoot) {
        const { data } = (0, interchange_1.parseInterchange)(interchange, genesisValidatorsRoot);
        for (const validator of data) {
            await this.blockService.importBlocks(validator.pubkey, validator.signedBlocks);
            await this.attestationService.importAttestations(validator.pubkey, validator.signedAttestations);
        }
    }
    async exportInterchange(genesisValidatorsRoot, pubkeys, formatVersion) {
        const validatorData = [];
        for (const pubkey of pubkeys) {
            validatorData.push({
                pubkey,
                signedBlocks: await this.blockService.exportBlocks(pubkey),
                signedAttestations: await this.attestationService.exportAttestations(pubkey),
            });
        }
        return (0, interchange_1.serializeInterchange)({ data: validatorData, genesisValidatorsRoot }, formatVersion);
    }
    async listPubkeys() {
        const pubkeysAtt = await this.attestationService.listPubkeys();
        const pubkeysBlk = await this.blockService.listPubkeys();
        return (0, utils_1.uniqueVectorArr)([...pubkeysAtt, ...pubkeysBlk]);
    }
}
exports.SlashingProtection = SlashingProtection;
//# sourceMappingURL=index.js.map