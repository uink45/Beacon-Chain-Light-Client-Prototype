"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sameType = exports.jsonType = exports.WithVersion = exports.ContainerData = exports.ArrayOf = exports.reqOnlyBody = exports.reqEmpty = exports.codeCase = exports.jsonOpts = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
// See /packages/api/src/routes/index.ts for reasoning
/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any */
/** All JSON must be sent in snake case */
exports.jsonOpts = { case: "snake" };
/** All JSON inside the JS code must be camel case */
exports.codeCase = "camel";
//
// Helpers
//
/** Shortcut for routes that have no params, query nor body */
exports.reqEmpty = {
    writeReq: () => ({}),
    parseReq: () => [],
};
/** Shortcut for routes that have only body */
const reqOnlyBody = (type, bodySchema) => ({
    writeReq: (items) => ({ body: type.toJson(items, exports.jsonOpts) }),
    parseReq: ({ body }) => [type.fromJson(body, exports.jsonOpts)],
    schema: { body: bodySchema },
});
exports.reqOnlyBody = reqOnlyBody;
/** SSZ factory helper + typed. limit = 1e6 as a big enough random number */
function ArrayOf(elementType, limit = 1e6) {
    return new ssz_1.ListType({ elementType, limit });
}
exports.ArrayOf = ArrayOf;
/**
 * SSZ factory helper + typed to return responses of type
 * ```
 * data: T
 * ```
 */
function ContainerData(dataType) {
    return {
        toJson: ({ data }, opts) => ({
            data: dataType.toJson(data, opts),
        }),
        fromJson: ({ data }, opts) => {
            return {
                data: dataType.fromJson(data, opts),
            };
        },
    };
}
exports.ContainerData = ContainerData;
/**
 * SSZ factory helper + typed to return responses of type
 * ```
 * data: T
 * version: ForkName
 * ```
 */
function WithVersion(getType) {
    return {
        toJson: ({ data, version }, opts) => ({
            data: getType(version || lodestar_params_1.ForkName.phase0).toJson(data, opts),
            version,
        }),
        fromJson: ({ data, version }, opts) => {
            // Un-safe external data, validate version is known ForkName value
            if (!lodestar_params_1.ForkName[version])
                throw Error(`Invalid version ${version}`);
            return {
                data: getType(version).fromJson(data, opts),
                version: version,
            };
        },
    };
}
exports.WithVersion = WithVersion;
/** Helper to only translate casing */
function jsonType() {
    return {
        toJson: (val, opts) => (0, lodestar_utils_1.objectToExpectedCase)(val, opts === null || opts === void 0 ? void 0 : opts.case),
        fromJson: (json) => (0, lodestar_utils_1.objectToExpectedCase)(json, exports.codeCase),
    };
}
exports.jsonType = jsonType;
/** Helper to not do any transformation with the type */
function sameType() {
    return {
        toJson: (val) => val,
        fromJson: (json) => json,
    };
}
exports.sameType = sameType;
//# sourceMappingURL=types.js.map