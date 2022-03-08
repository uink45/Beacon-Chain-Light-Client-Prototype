import { Api } from "@chainsafe/lodestar-api";
import { IClock, ILoggerVc } from "../util";
import { ValidatorStore } from "./validatorStore";
import { IndicesService } from "./indices";
import { ChainHeaderTracker } from "./chainHeaderTracker";
import { ValidatorEventEmitter } from "./emitter";
/**
 * Service that sets up and handles validator attester duties.
 */
export declare class AttestationService {
    private readonly logger;
    private readonly api;
    private readonly clock;
    private readonly validatorStore;
    private readonly emitter;
    private readonly dutiesService;
    constructor(logger: ILoggerVc, api: Api, clock: IClock, validatorStore: ValidatorStore, emitter: ValidatorEventEmitter, indicesService: IndicesService, chainHeadTracker: ChainHeaderTracker);
    private runAttestationTasks;
    private waitForBlockSlot;
    private publishAttestationsAndAggregates;
    /**
     * Performs the first step of the attesting process: downloading `Attestation` objects,
     * signing them and returning them to the validator.
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/validator.md#attesting
     *
     * Only one `Attestation` is downloaded from the BN. It is then signed by each
     * validator and the list of individually-signed `Attestation` objects is returned to the BN.
     */
    private produceAndPublishAttestations;
    /**
     * Performs the second step of the attesting process: downloading an aggregated `Attestation`,
     * converting it into a `SignedAggregateAndProof` and returning it to the BN.
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/validator.md#broadcast-aggregate
     *
     * Only one aggregated `Attestation` is downloaded from the BN. It is then signed
     * by each validator and the list of individually-signed `SignedAggregateAndProof` objects is
     * returned to the BN.
     */
    private produceAndPublishAggregates;
}
//# sourceMappingURL=attestation.d.ts.map