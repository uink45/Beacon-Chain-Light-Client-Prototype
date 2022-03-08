import { ForkChoiceOpts } from "./forkChoice";
export declare type IChainOptions = BlockProcessOpts & ForkChoiceOpts & {
    blsVerifyAllMainThread?: boolean;
    blsVerifyAllMultiThread?: boolean;
    persistInvalidSszObjects?: boolean;
    persistInvalidSszObjectsDir: string;
};
export declare type BlockProcessOpts = {
    /**
     * Do not use BLS batch verify to validate all block signatures at once.
     * Will double processing times. Use only for debugging purposes.
     */
    disableBlsBatchVerify?: boolean;
    /**
     * Override SAFE_SLOTS_TO_IMPORT_OPTIMISTICALLY
     */
    safeSlotsToImportOptimistically: number;
};
export declare const defaultChainOptions: IChainOptions;
//# sourceMappingURL=options.d.ts.map