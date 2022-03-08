import { BeaconPreset } from "@chainsafe/lodestar-params";
import { IChainConfig } from "@chainsafe/lodestar-config";
import { Bytes32, Number64, phase0 } from "@chainsafe/lodestar-types";
import { ReqEmpty, ReturnTypes, ReqSerializers, RoutesData } from "../utils";
export declare type DepositContract = {
    chainId: Number64;
    address: Bytes32;
};
export declare type Spec = BeaconPreset & IChainConfig;
export declare type Api = {
    /**
     * Get deposit contract address.
     * Retrieve Eth1 deposit contract address and chain ID.
     */
    getDepositContract(): Promise<{
        data: DepositContract;
    }>;
    /**
     * Get scheduled upcoming forks.
     * Retrieve all scheduled upcoming forks this node is aware of.
     */
    getForkSchedule(): Promise<{
        data: phase0.Fork[];
    }>;
    /**
     * Retrieve specification configuration used on this node.  The configuration should include:
     *  - Constants for all hard forks known by the beacon node, for example the [phase 0](https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/beacon-chain.md#constants) and [altair](https://github.com/ethereum/eth2.0-specs/blob/dev/specs/altair/beacon-chain.md#constants) values
     *  - Presets for all hard forks supplied to the beacon node, for example the [phase 0](https://github.com/ethereum/eth2.0-specs/blob/dev/presets/mainnet/phase0.yaml) and [altair](https://github.com/ethereum/eth2.0-specs/blob/dev/presets/mainnet/altair.yaml) values
     *  - Configuration for the beacon node, for example the [mainnet](https://github.com/ethereum/eth2.0-specs/blob/dev/configs/mainnet.yaml) values
     *
     * Values are returned with following format:
     * - any value starting with 0x in the spec is returned as a hex string
     * - numeric values are returned as a quoted integer
     */
    getSpec(): Promise<{
        data: Record<string, string>;
    }>;
};
/**
 * Define javascript values for each route
 */
export declare const routesData: RoutesData<Api>;
export declare type ReqTypes = {
    [K in keyof Api]: ReqEmpty;
};
export declare function getReqSerializers(): ReqSerializers<Api, ReqTypes>;
export declare function getReturnTypes(): ReturnTypes<Api>;
//# sourceMappingURL=config.d.ts.map