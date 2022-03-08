"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wssOptions = exports.parseWSSArgs = void 0;
function parseWSSArgs(args) {
    const { weakSubjectivityStateFile, weakSubjectivitySyncLatest, weakSubjectivityServerUrl, weakSubjectivityCheckpoint, } = args;
    if (weakSubjectivityStateFile) {
        return { weakSubjectivityStateFile, weakSubjectivityCheckpoint };
    }
    else if (weakSubjectivitySyncLatest) {
        if (!weakSubjectivityServerUrl) {
            throw Error("Must set arg --weakSubjectivityServerUrl for wss sync");
        }
        return { weakSubjectivitySyncLatest, weakSubjectivityServerUrl, weakSubjectivityCheckpoint };
    }
    else {
        return null;
    }
}
exports.parseWSSArgs = parseWSSArgs;
exports.wssOptions = {
    weakSubjectivityStateFile: {
        description: "Path or URL to download a weak subjectivity state file in ssz-encoded format",
        type: "string",
        group: "weakSubjectivity",
    },
    weakSubjectivitySyncLatest: {
        description: "Sync and start from a weak subjectivity state at --weakSubjectivityCheckpoint (if provided, else fetches the latest finalized) via the --weakSubjectivityServerUrl",
        type: "boolean",
        group: "weakSubjectivity",
    },
    weakSubjectivityServerUrl: {
        description: "Pass in a server url hosting Beacon Node APIs from which to fetch weak subjectivity state, required in conjunction with --weakSubjectivitySyncLatest or --weakSubjectivityCheckpoint.",
        type: "string",
        group: "weakSubjectivity",
    },
    weakSubjectivityCheckpoint: {
        description: "To fetch and start beacon node off a state at the provided weakSubjectivity checkpoint, to be supplied in <blockRoot>:<epoch> format. For example, 0x1234:100 will sync and start off from the weakSubjectivity state at checkpoint of epoch 100 with block root 0x1234.",
        type: "string",
        group: "weakSubjectivity",
    },
};
//# sourceMappingURL=wssOptions.js.map