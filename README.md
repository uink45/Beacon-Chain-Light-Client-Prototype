## Lantern.
This is a C# implementation of the [Altair Minimal Light Client Specification](https://github.com/ethereum/consensus-specs/blob/dev/specs/altair/sync-protocol.md), also known as a light client for the consensus layer. If interested in learning more about light clients in Ethereum, I have written an [introductory article](https://mycelium.xyz/research/world-of-light-clients-ethereum), explaining how they work.

### Functionality
Currently, the prototype can track the latest block header in the beacon chain. It achieves this by initializing from a trusted snapshot to know the current sync committee. The snapshot is verified by checking whether the current sync committee branch is valid. It then trustlessly verifies the upcoming block headers by checking if the sync committee signature is valid and enough validators had signed. 

### Requirements
- .NET Core 5.0 or greater ([Latest version available here](https://dotnet.microsoft.com/en-us/download))
- Node.js ([Available here](https://nodejs.org/en/download/))
### Before Running
To initialize and sync with the beacon chain, the light client requires a local server to send REST-API requests. The server is a modified version of the Lodestar beacon chain client, available to download from the [Light-Client-Server](https://github.com/uink45/Light-Client-Server) repository. Enter the following commands in the command prompt to initilialise the server: 

```
yarn install
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
After running the commands above, head to https://localhost:5001/.
