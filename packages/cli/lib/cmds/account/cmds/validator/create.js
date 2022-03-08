"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.validatorCreateOptions = void 0;
const paths_1 = require("../../paths");
const wallet_1 = require("../../../../wallet");
const validatorDir_1 = require("../../../../validatorDir");
const config_1 = require("../../../../config");
const util_1 = require("../../../../util");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
exports.validatorCreateOptions = {
    name: {
        description: "Use the wallet identified by this name",
        alias: ["n"],
        demandOption: true,
        type: "string",
    },
    passphraseFile: {
        description: "A path to a file containing the password which will unlock the wallet.",
        alias: ["p"],
        demandOption: true,
        type: "string",
    },
    depositGwei: {
        description: "The GWEI value of the deposit amount. Defaults to the minimum amount \
required for an active validator (MAX_EFFECTIVE_BALANCE)",
        type: "string",
    },
    storeWithdrawalKeystore: {
        description: "If present, the withdrawal keystore will be stored alongside the voting \
keypair. It is generally recommended to *not* store the withdrawal key and \
instead generate them from the wallet seed when required.",
        type: "boolean",
    },
    count: {
        description: "The number of validators to create",
        default: 1,
        type: "number",
    },
};
exports.create = {
    command: "create",
    describe: "Creates new validators from an existing EIP-2386 wallet using the EIP-2333 HD key \
derivation scheme. Creates a new directory per validator with a voting keystore, withdrawal keystore, \
and pre-computed deposit RPL data",
    examples: [
        {
            command: "account validator create --name primary --passphraseFile primary.pass",
            description: "Create a validator from HD wallet named 'primary'",
        },
    ],
    options: exports.validatorCreateOptions,
    handler: async (args) => {
        // Necessary to compute validator pubkey from privKey
        await (0, util_1.initBLS)();
        const config = (0, config_1.getBeaconConfigFromArgs)(args);
        const { name, passphraseFile, storeWithdrawalKeystore, count } = args;
        const accountPaths = (0, paths_1.getAccountPaths)(args);
        const maxEffectiveBalance = lodestar_params_1.MAX_EFFECTIVE_BALANCE;
        const depositGwei = Number(args.depositGwei || 0) || maxEffectiveBalance;
        if (depositGwei > maxEffectiveBalance)
            throw new util_1.YargsError(`depositGwei ${depositGwei} is higher than MAX_EFFECTIVE_BALANCE ${maxEffectiveBalance}`);
        const validatorDirBuilder = new validatorDir_1.ValidatorDirBuilder(accountPaths);
        const walletManager = new wallet_1.WalletManager(accountPaths);
        const wallet = walletManager.openByName(name);
        if (count <= 0)
            throw new util_1.YargsError("No validators to create");
        const walletPassword = (0, util_1.readPassphraseFile)(passphraseFile);
        const pubkeys = [];
        for (let i = 0; i < count; i++) {
            const passwords = wallet.randomPasswords();
            const keystores = await wallet.nextValidator(walletPassword, passwords);
            await validatorDirBuilder.build({ keystores, passwords, storeWithdrawalKeystore, depositGwei, config });
            // Persist the nextaccount index after successfully creating the validator directory
            walletManager.writeWallet(wallet);
            const pubkey = (0, util_1.add0xPrefix)(keystores.signing.pubkey);
            // eslint-disable-next-line no-console
            console.log(`${i}/${count}\t${pubkey}`);
            pubkeys.push(pubkey);
        }
        // Return values for testing
        return pubkeys;
    },
};
//# sourceMappingURL=create.js.map