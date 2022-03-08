"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveKeystorePaths = exports.groupExternalSignersByUrl = exports.getExternalSigners = exports.getLocalSecretKeys = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const bls_keystore_1 = require("@chainsafe/bls-keystore");
const bls_1 = require("@chainsafe/bls");
const bls_keygen_1 = require("@chainsafe/bls-keygen");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_validator_1 = require("@chainsafe/lodestar-validator");
const options_1 = require("../../options");
const util_1 = require("../../util");
const lockfile_1 = require("../../util/lockfile");
const validatorDir_1 = require("../../validatorDir");
const paths_1 = require("../account/paths");
const ssz_1 = require("@chainsafe/ssz");
const LOCK_FILE_EXT = ".lock";
const depositDataPattern = new RegExp(/^deposit_data-\d+\.json$/gi);
async function getLocalSecretKeys(args) {
    // UNSAFE - ONLY USE FOR TESTNETS. Derive keys directly from a mnemonic
    if (args.fromMnemonic) {
        if (args.network === options_1.defaultNetwork) {
            throw new util_1.YargsError("fromMnemonic must only be used in testnets");
        }
        if (!args.mnemonicIndexes) {
            throw new util_1.YargsError("Must specify mnemonicIndexes with fromMnemonic");
        }
        const masterSK = (0, bls_keygen_1.deriveKeyFromMnemonic)(args.fromMnemonic);
        const indexes = (0, util_1.parseRange)(args.mnemonicIndexes);
        return {
            secretKeys: indexes.map((index) => {
                const { signing } = (0, bls_keygen_1.deriveEth2ValidatorKeys)(masterSK, index);
                return bls_1.SecretKey.fromBytes(signing);
            }),
        };
    }
    // Derive interop keys
    else if (args.interopIndexes) {
        const indexes = (0, util_1.parseRange)(args.interopIndexes);
        return { secretKeys: indexes.map((index) => (0, lodestar_beacon_state_transition_1.interopSecretKey)(index)) };
    }
    // Import JSON keystores and run
    else if (args.importKeystoresPath) {
        if (!args.importKeystoresPassword) {
            throw new util_1.YargsError("Must specify importKeystoresPassword with importKeystoresPath");
        }
        const passphrase = (0, util_1.stripOffNewlines)(node_fs_1.default.readFileSync(args.importKeystoresPassword, "utf8"));
        const keystorePaths = args.importKeystoresPath.map((filepath) => resolveKeystorePaths(filepath)).flat(1);
        // Create lock files for all keystores
        const lockFile = (0, lockfile_1.getLockFile)();
        const lockFilePaths = keystorePaths.map((keystorePath) => keystorePath + LOCK_FILE_EXT);
        // Lock all keystores first
        for (const lockFilePath of lockFilePaths) {
            lockFile.lockSync(lockFilePath);
        }
        const secretKeys = await Promise.all(keystorePaths.map(async (keystorePath) => bls_1.SecretKey.fromBytes(await bls_keystore_1.Keystore.parse(node_fs_1.default.readFileSync(keystorePath, "utf8")).decrypt(passphrase))));
        return {
            secretKeys,
            unlockSecretKeys: () => {
                for (const lockFilePath of lockFilePaths) {
                    lockFile.unlockSync(lockFilePath);
                }
            },
        };
    }
    // Read keys from local account manager
    else {
        const accountPaths = (0, paths_1.getAccountPaths)(args);
        const validatorDirManager = new validatorDir_1.ValidatorDirManager(accountPaths);
        return { secretKeys: await validatorDirManager.decryptAllValidators({ force: args.force }) };
    }
}
exports.getLocalSecretKeys = getLocalSecretKeys;
/**
 * Gets SignerRemote objects from CLI args
 */
async function getExternalSigners(args) {
    // Remote keys declared manually with --externalSignerPublicKeys
    if (args.externalSignerPublicKeys) {
        if (args.externalSignerPublicKeys.length === 0) {
            throw new util_1.YargsError("externalSignerPublicKeys is set to an empty list");
        }
        const externalSignerUrl = args.externalSignerUrl;
        if (!externalSignerUrl) {
            throw new util_1.YargsError("Must set externalSignerUrl with externalSignerPublicKeys");
        }
        assertValidPubkeysHex(args.externalSignerPublicKeys);
        assertValidExternalSignerUrl(externalSignerUrl);
        return args.externalSignerPublicKeys.map((pubkeyHex) => ({ pubkeyHex, externalSignerUrl }));
    }
    if (args.externalSignerFetchPubkeys) {
        const externalSignerUrl = args.externalSignerUrl;
        if (!externalSignerUrl) {
            throw new util_1.YargsError("Must set externalSignerUrl with externalSignerFetchPubkeys");
        }
        const fetchedPubkeys = await (0, lodestar_validator_1.externalSignerGetKeys)(externalSignerUrl);
        assertValidPubkeysHex(fetchedPubkeys);
        return fetchedPubkeys.map((pubkeyHex) => ({ pubkeyHex, externalSignerUrl }));
    }
    return [];
}
exports.getExternalSigners = getExternalSigners;
/**
 * Only used for logging remote signers grouped by URL
 */
function groupExternalSignersByUrl(externalSigners) {
    const byUrl = new Map();
    for (const externalSigner of externalSigners) {
        let x = byUrl.get(externalSigner.externalSignerUrl);
        if (!x) {
            x = { externalSignerUrl: externalSigner.externalSignerUrl, pubkeysHex: [] };
            byUrl.set(externalSigner.externalSignerUrl, x);
        }
        x.pubkeysHex.push(externalSigner.pubkeyHex);
    }
    return Array.from(byUrl.values());
}
exports.groupExternalSignersByUrl = groupExternalSignersByUrl;
/**
 * Ensure pubkeysHex are valid BLS pubkey (validate hex encoding and point)
 */
function assertValidPubkeysHex(pubkeysHex) {
    for (const pubkeyHex of pubkeysHex) {
        const pubkeyBytes = (0, ssz_1.fromHexString)(pubkeyHex);
        bls_1.PublicKey.fromBytes(pubkeyBytes, bls_1.CoordType.jacobian, true);
    }
}
function assertValidExternalSignerUrl(urlStr) {
    if (!isValidHttpUrl(urlStr)) {
        throw new util_1.YargsError(`Invalid external signer URL ${urlStr}`);
    }
}
function isValidHttpUrl(urlStr) {
    let url;
    try {
        url = new URL(urlStr);
    }
    catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
function resolveKeystorePaths(fileOrDirPath) {
    if (node_fs_1.default.lstatSync(fileOrDirPath).isDirectory()) {
        return node_fs_1.default
            .readdirSync(fileOrDirPath)
            .filter((file) => !depositDataPattern.test(file))
            .map((file) => node_path_1.default.join(fileOrDirPath, file));
    }
    else {
        return [fileOrDirPath];
    }
}
exports.resolveKeystorePaths = resolveKeystorePaths;
//# sourceMappingURL=keys.js.map