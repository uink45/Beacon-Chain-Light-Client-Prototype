"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorOptions = void 0;
const paths_1 = require("./paths");
const options_1 = require("../account/cmds/validator/options");
const options_2 = require("../beacon/options");
exports.validatorOptions = {
    ...options_1.accountValidatorOptions,
    ...options_2.logOptions,
    logFile: options_2.beaconPathsOptions.logFile,
    validatorsDbDir: {
        description: "Data directory for validator databases.",
        defaultDescription: paths_1.defaultValidatorPaths.validatorsDbDir,
        type: "string",
    },
    server: {
        description: "Address to connect to BeaconNode",
        default: "http://127.0.0.1:9596",
        type: "string",
    },
    force: {
        description: "Open validators even if there's a lockfile. Use with caution",
        type: "boolean",
    },
    graffiti: {
        description: "Specify your custom graffiti to be included in blocks (plain UTF8 text, 32 characters max)",
        // Don't use a default here since it should be computed only if necessary by getDefaultGraffiti()
        type: "string",
    },
    importKeystoresPath: {
        description: "Path(s) to a directory or single filepath to validator keystores, i.e. Launchpad validators",
        defaultDescription: "./keystores/*.json",
        type: "array",
    },
    importKeystoresPassword: {
        description: "Path to a file with password to decrypt all keystores from importKeystoresPath option",
        defaultDescription: "./password.txt",
        type: "string",
    },
    // Remote signer
    externalSignerUrl: {
        description: "URL to connect to an external signing server",
        type: "string",
        group: "External signer",
    },
    externalSignerPublicKeys: {
        description: "List of validator public keys used by an external signer. May also provide a single string a comma separated public keys",
        type: "array",
        coerce: (pubkeys) => 
        // Parse ["0x11,0x22"] to ["0x11", "0x22"]
        pubkeys.map((item) => item.split(",")).flat(1),
        group: "External signer",
    },
    externalSignerFetchPubkeys: {
        description: "Fetch then list of pubkeys to validate from an external signer",
        type: "boolean",
        group: "External signer",
    },
    // For testing only
    interopIndexes: {
        hidden: true,
        description: "Range (inclusive) of interop key indexes to validate with: 0..16",
        type: "string",
    },
    fromMnemonic: {
        hidden: true,
        description: "UNSAFE. Run keys from a mnemonic. Requires mnemonicIndexes option",
        type: "string",
    },
    mnemonicIndexes: {
        hidden: true,
        description: "UNSAFE. Range (inclusive) of mnemonic key indexes to validate with: 0..16",
        type: "string",
    },
};
//# sourceMappingURL=options.js.map