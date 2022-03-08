"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOutgoingReqRespError = void 0;
const score_1 = require("../peers/score");
const types_1 = require("./types");
const request_1 = require("./request");
/**
 * libp2p-ts does not include types for the error codes.
 * When libp2p has native types, this object won't be necessary.
 * https://github.com/libp2p/js-libp2p/blob/6350a187c7c207086e42436ccbcabd59af6f5e3d/src/errors.js#L32
 */
const libp2pErrorCodes = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ERR_UNSUPPORTED_PROTOCOL: "ERR_UNSUPPORTED_PROTOCOL",
};
/**
 * Multi stream select error code
 * https://github.com/multiformats/js-multistream-select/blame/cf4e297b362a43bde2ea117085ceba78cbce1c12/src/select.js#L50
 */
const multiStreamSelectErrorCodes = {
    protocolSelectionFailed: "protocol selection failed",
};
function onOutgoingReqRespError(e, method) {
    if (e instanceof request_1.RequestError) {
        switch (e.type.code) {
            case request_1.RequestErrorCode.INVALID_REQUEST:
                return score_1.PeerAction.LowToleranceError;
            case request_1.RequestErrorCode.SERVER_ERROR:
                return score_1.PeerAction.MidToleranceError;
            case request_1.RequestErrorCode.UNKNOWN_ERROR_STATUS:
                return score_1.PeerAction.HighToleranceError;
            case request_1.RequestErrorCode.DIAL_TIMEOUT:
            case request_1.RequestErrorCode.DIAL_ERROR:
                return e.message.includes(multiStreamSelectErrorCodes.protocolSelectionFailed) && method === types_1.Method.Ping
                    ? score_1.PeerAction.Fatal
                    : score_1.PeerAction.LowToleranceError;
            // TODO: Detect SSZDecodeError and return PeerAction.Fatal
            case request_1.RequestErrorCode.TTFB_TIMEOUT:
            case request_1.RequestErrorCode.RESP_TIMEOUT:
                switch (method) {
                    case types_1.Method.Ping:
                        return score_1.PeerAction.LowToleranceError;
                    case types_1.Method.BeaconBlocksByRange:
                    case types_1.Method.BeaconBlocksByRoot:
                        return score_1.PeerAction.MidToleranceError;
                    default:
                        return null;
                }
        }
    }
    if (e.message.includes(libp2pErrorCodes.ERR_UNSUPPORTED_PROTOCOL)) {
        switch (method) {
            case types_1.Method.Ping:
                return score_1.PeerAction.Fatal;
            case types_1.Method.Metadata:
            case types_1.Method.Status:
                return score_1.PeerAction.LowToleranceError;
            default:
                return null;
        }
    }
    return null;
}
exports.onOutgoingReqRespError = onOutgoingReqRespError;
//# sourceMappingURL=score.js.map