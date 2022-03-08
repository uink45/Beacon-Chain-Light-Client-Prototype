import { AbortSignal } from "@chainsafe/abort-controller";
import { IDatabaseApiOptions } from "@chainsafe/lodestar-db";
import { Genesis } from "@chainsafe/lodestar-types/phase0";
import { ILogger } from "@chainsafe/lodestar-utils";
import { Api } from "@chainsafe/lodestar-api";
import { ISlashingProtection } from "./slashingProtection";
import { Signer } from "./services/validatorStore";
export declare type ValidatorOptions = {
    slashingProtection: ISlashingProtection;
    dbOps: IDatabaseApiOptions;
    api: Api | string;
    signers: Signer[];
    logger: ILogger;
    graffiti?: string;
};
/**
 * Main class for the Validator client.
 */
export declare class Validator {
    private readonly config;
    private readonly api;
    private readonly clock;
    private readonly emitter;
    private readonly chainHeaderTracker;
    private readonly validatorStore;
    private readonly logger;
    private state;
    constructor(opts: ValidatorOptions, genesis: Genesis);
    /** Waits for genesis and genesis time */
    static initializeFromBeaconNode(opts: ValidatorOptions, signal?: AbortSignal): Promise<Validator>;
    /**
     * Instantiates block and attestation services and runs them once the chain has been started.
     */
    start(): Promise<void>;
    /**
     * Stops all validator functions.
     */
    stop(): Promise<void>;
    /**
     * Perform a voluntary exit for the given validator by its key.
     */
    voluntaryExit(publicKey: string, exitEpoch?: number): Promise<void>;
    /** Provide the current AbortSignal to the api instance */
    private getAbortSignal;
}
//# sourceMappingURL=validator.d.ts.map