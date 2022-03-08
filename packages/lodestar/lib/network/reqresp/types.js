"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reqRespBlockResponseSerializer = exports.getOutgoingSerializerByMethod = exports.getResponseSzzTypeByMethod = exports.getRequestSzzTypeByMethod = exports.contextBytesTypeByProtocol = exports.ContextBytesType = exports.CONTEXT_BYTES_FORK_DIGEST_LENGTH = exports.deserializeToTreeByMethod = exports.isSingleResponseChunkByMethod = exports.protocolsSupported = exports.Encoding = exports.Version = exports.Method = exports.protocolPrefix = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
exports.protocolPrefix = "/eth2/beacon_chain/req";
/** ReqResp protocol names or methods. Each Method can have multiple versions and encodings */
var Method;
(function (Method) {
    Method["Status"] = "status";
    Method["Goodbye"] = "goodbye";
    Method["Ping"] = "ping";
    Method["Metadata"] = "metadata";
    Method["BeaconBlocksByRange"] = "beacon_blocks_by_range";
    Method["BeaconBlocksByRoot"] = "beacon_blocks_by_root";
})(Method = exports.Method || (exports.Method = {}));
/** RPC Versions */
var Version;
(function (Version) {
    Version["V1"] = "1";
    Version["V2"] = "2";
})(Version = exports.Version || (exports.Version = {}));
/**
 * Available request/response encoding strategies:
 * https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/p2p-interface.md#encoding-strategies
 */
var Encoding;
(function (Encoding) {
    Encoding["SSZ_SNAPPY"] = "ssz_snappy";
})(Encoding = exports.Encoding || (exports.Encoding = {}));
exports.protocolsSupported = [
    [Method.Status, Version.V1, Encoding.SSZ_SNAPPY],
    [Method.Goodbye, Version.V1, Encoding.SSZ_SNAPPY],
    [Method.Ping, Version.V1, Encoding.SSZ_SNAPPY],
    [Method.Metadata, Version.V1, Encoding.SSZ_SNAPPY],
    [Method.Metadata, Version.V2, Encoding.SSZ_SNAPPY],
    [Method.BeaconBlocksByRange, Version.V1, Encoding.SSZ_SNAPPY],
    [Method.BeaconBlocksByRange, Version.V2, Encoding.SSZ_SNAPPY],
    [Method.BeaconBlocksByRoot, Version.V1, Encoding.SSZ_SNAPPY],
    [Method.BeaconBlocksByRoot, Version.V2, Encoding.SSZ_SNAPPY],
];
exports.isSingleResponseChunkByMethod = {
    [Method.Status]: true,
    [Method.Goodbye]: true,
    [Method.Ping]: true,
    [Method.Metadata]: true,
    [Method.BeaconBlocksByRange]: false,
    [Method.BeaconBlocksByRoot]: false,
};
/** Deserialize some types to TreeBacked directly for more efficient hashing */
exports.deserializeToTreeByMethod = {
    [Method.Status]: false,
    [Method.Goodbye]: false,
    [Method.Ping]: false,
    [Method.Metadata]: false,
    [Method.BeaconBlocksByRange]: true,
    [Method.BeaconBlocksByRoot]: true,
};
exports.CONTEXT_BYTES_FORK_DIGEST_LENGTH = 4;
var ContextBytesType;
(function (ContextBytesType) {
    /** 0 bytes chunk, can be ignored */
    ContextBytesType[ContextBytesType["Empty"] = 0] = "Empty";
    /** A fixed-width 4 byte <context-bytes>, set to the ForkDigest matching the chunk: compute_fork_digest(fork_version, genesis_validators_root) */
    ContextBytesType[ContextBytesType["ForkDigest"] = 1] = "ForkDigest";
})(ContextBytesType = exports.ContextBytesType || (exports.ContextBytesType = {}));
/** Meaning of the <context-bytes> chunk per protocol */
function contextBytesTypeByProtocol(protocol) {
    switch (protocol.method) {
        case Method.Status:
        case Method.Goodbye:
        case Method.Ping:
        case Method.Metadata:
            return ContextBytesType.Empty;
        case Method.BeaconBlocksByRange:
        case Method.BeaconBlocksByRoot:
            switch (protocol.version) {
                case Version.V1:
                    return ContextBytesType.Empty;
                case Version.V2:
                    return ContextBytesType.ForkDigest;
            }
    }
}
exports.contextBytesTypeByProtocol = contextBytesTypeByProtocol;
/** Request SSZ type for each method and ForkName */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
function getRequestSzzTypeByMethod(method) {
    switch (method) {
        case Method.Status:
            return lodestar_types_1.ssz.phase0.Status;
        case Method.Goodbye:
            return lodestar_types_1.ssz.phase0.Goodbye;
        case Method.Ping:
            return lodestar_types_1.ssz.phase0.Ping;
        case Method.Metadata:
            return null;
        case Method.BeaconBlocksByRange:
            return lodestar_types_1.ssz.phase0.BeaconBlocksByRangeRequest;
        case Method.BeaconBlocksByRoot:
            return lodestar_types_1.ssz.phase0.BeaconBlocksByRootRequest;
    }
}
exports.getRequestSzzTypeByMethod = getRequestSzzTypeByMethod;
/** Response SSZ type for each method and ForkName */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
function getResponseSzzTypeByMethod(protocol, forkName) {
    switch (protocol.method) {
        case Method.Status:
            return lodestar_types_1.ssz.phase0.Status;
        case Method.Goodbye:
            return lodestar_types_1.ssz.phase0.Goodbye;
        case Method.Ping:
            return lodestar_types_1.ssz.phase0.Ping;
        case Method.Metadata: {
            // V1 -> phase0.Metadata, V2 -> altair.Metadata
            const fork = protocol.version === Version.V1 ? lodestar_params_1.ForkName.phase0 : lodestar_params_1.ForkName.altair;
            return lodestar_types_1.ssz[fork].Metadata;
        }
        case Method.BeaconBlocksByRange:
        case Method.BeaconBlocksByRoot:
            // SignedBeaconBlock type is changed in altair
            return lodestar_types_1.ssz[forkName].SignedBeaconBlock;
    }
}
exports.getResponseSzzTypeByMethod = getResponseSzzTypeByMethod;
/** Return either an ssz type or the serializer for ReqRespBlockResponse */
function getOutgoingSerializerByMethod(protocol) {
    switch (protocol.method) {
        case Method.Status:
            return lodestar_types_1.ssz.phase0.Status;
        case Method.Goodbye:
            return lodestar_types_1.ssz.phase0.Goodbye;
        case Method.Ping:
            return lodestar_types_1.ssz.phase0.Ping;
        case Method.Metadata: {
            // V1 -> phase0.Metadata, V2 -> altair.Metadata
            const fork = protocol.version === Version.V1 ? lodestar_params_1.ForkName.phase0 : lodestar_params_1.ForkName.altair;
            return lodestar_types_1.ssz[fork].Metadata;
        }
        case Method.BeaconBlocksByRange:
        case Method.BeaconBlocksByRoot:
            return exports.reqRespBlockResponseSerializer;
    }
}
exports.getOutgoingSerializerByMethod = getOutgoingSerializerByMethod;
/** Serializer for ReqRespBlockResponse */
exports.reqRespBlockResponseSerializer = {
    serialize: (chunk) => {
        return chunk.bytes;
    },
};
//# sourceMappingURL=types.js.map