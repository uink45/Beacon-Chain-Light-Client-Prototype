# Beacon Chain Light Client Prototype

This is a C# implementation of the [Altair Minimal Light Client Specification](https://github.com/ethereum/consensus-specs/blob/dev/specs/altair/sync-protocol.md). 

### Functionality
Currently, the prototype can track the latest block header in the beacon chain. It achieves this by initializing from a trusted snapshot to know the current sync committee. The snapshot is verified by checking whether the current sync committee branch is valid. It then trustlessly verifies the upcoming block headers by checking if the sync committee signature is valid and enough validators had signed. 

### Requirements
- .NET Core 5.0 or greater ([Latest version available here](https://dotnet.microsoft.com/en-us/download))

### Before Running
To initialize and sync with the beacon chain, the light client requires a local server to send REST-API requests. The server is the [Lodestar Beacon-chain client](https://github.com/ChainSafe/lodestar), created by the [Chainsafe](https://github.com/ChainSafe) team. Its installation and building instructions are available  in their [documentation](https://chainsafe.github.io/lodestar/installation/). When successfully installed and built, run it using the following command:
```
node --trace-deprecation --max-old-space-size=6144 packages/cli/bin/lodestar beacon --eth1.enabled false --network mainnet --weakSubjectivityServerUrl https://21qajKWbOdMuXWCCPEbxW1bVPrp:5e43bc9d09711d4f34b55077cdb3380a@eth2-beacon-mainnet.infura.io --weakSubjectivitySyncLatest true --api.rest.api "lightclient" "beacon"
```

After it has subscribed to gossip core topics and reached `Synced` status, follow the commands below to initialize the light client.

### Installation & Running
```
git clone https://github.com/uink45/Beacon-Chain-Light-Client-Prototype.git
cd Beacon-Chain-Light-Client-Prototype/Lantern
dotnet build
dotnet run
```

### Troubleshooting
#### Light client
- `Error: Slot to process should be greater than current slot`. This error occurs when the light client receives an older block from the server. It will continue to function, as it will re-submit the query to fetch a more recent block.

#### Lodestar Beacon-chain client
- If the beacon-chain client is initialized from a weak subjectivity checkpoint, it may start displaying multiple errors related to the finality header and backfill syncing. These errors are harmless and will be suppressed by the Chainsafe team (progress can be tracked [here](https://github.com/ChainSafe/lodestar/issues/3605)).
