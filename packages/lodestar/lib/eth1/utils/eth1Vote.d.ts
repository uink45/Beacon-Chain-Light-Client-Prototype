import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { allForks, phase0 } from "@chainsafe/lodestar-types";
export declare type Eth1DataGetter = ({ timestampRange, }: {
    timestampRange: {
        gte: number;
        lte: number;
    };
}) => Promise<phase0.Eth1Data[]>;
export declare function getEth1VotesToConsider(config: IChainForkConfig, state: allForks.BeaconState, eth1DataGetter: Eth1DataGetter): Promise<phase0.Eth1Data[]>;
export declare function pickEth1Vote(state: allForks.BeaconState, votesToConsider: phase0.Eth1Data[]): phase0.Eth1Data;
/**
 * Serialize eth1Data types to a unique string ID. It is only used for comparison.
 */
export declare function fastSerializeEth1Data(eth1Data: phase0.Eth1Data): string;
export declare function votingPeriodStartTime(config: IChainForkConfig, state: allForks.BeaconState): number;
//# sourceMappingURL=eth1Vote.d.ts.map