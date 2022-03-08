import { ICliCommandOptions } from "../util";
export declare type WSSOptions = {
    weakSubjectivityStateFile: string;
    weakSubjectivitySyncLatest: undefined;
    weakSubjectivityServerUrl: undefined;
    weakSubjectivityCheckpoint: string | undefined;
} | {
    weakSubjectivityStateFile: undefined;
    weakSubjectivitySyncLatest: boolean;
    weakSubjectivityServerUrl: string;
    weakSubjectivityCheckpoint: string | undefined;
};
export interface IWSSArgs {
    weakSubjectivityStateFile: string;
    weakSubjectivitySyncLatest: boolean;
    weakSubjectivityServerUrl: string;
    weakSubjectivityCheckpoint: string;
}
export declare function parseWSSArgs(args: IWSSArgs): WSSOptions | null;
export declare const wssOptions: ICliCommandOptions<IWSSArgs>;
//# sourceMappingURL=wssOptions.d.ts.map