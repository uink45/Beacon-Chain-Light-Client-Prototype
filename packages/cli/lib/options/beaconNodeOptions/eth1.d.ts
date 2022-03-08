import { IBeaconNodeOptions } from "@chainsafe/lodestar";
import { ICliCommandOptions } from "../../util";
export interface IEth1Args {
    "eth1.enabled": boolean;
    "eth1.providerUrl": string;
    "eth1.providerUrls": string[];
    "eth1.depositContractDeployBlock": number;
    "eth1.disableEth1DepositDataTracker": boolean;
    "eth1.unsafeAllowDepositDataOverwrite": boolean;
}
export declare function parseArgs(args: IEth1Args): IBeaconNodeOptions["eth1"];
export declare const options: ICliCommandOptions<IEth1Args>;
//# sourceMappingURL=eth1.d.ts.map