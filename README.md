# Beacon Chain Light Client Prototype

This is a C# implementation of the [Altair Minimal Light Client Specification](https://github.com/ethereum/consensus-specs/blob/dev/specs/altair/sync-protocol.md). 

### Functionality
Currently, the prototype can track the latest block header in the beacon chain. It achieves this by initializing from a trusted snapshot to know the current sync committee. The snapshot is verified by checking whether the current sync committee branch is valid. It then trustlessly verifies the upcoming block headers by checking if the sync committee signature is valid and that enough validators had signed. 

### Requirements
- .NET Core 5.0 or greater ([Latest version available here](https://dotnet.microsoft.com/en-us/download))

### Before Running
To initialize and sync with the beacon chain, the light client requires a local server to send REST-API requests. This server is a modified version of the [Lodestar Beacon Chain Client](https://github.com/ChainSafe/lodestar), created by the [Chainsafe](https://github.com/ChainSafe) team. In the [Light-Client-Server](https://github.com/uink45/Light-Client-Server) repository, follow the instructions in the [README](https://github.com/uink45/Light-Client-Server/blob/main/README.md) file to start the server. After it has subscribed to gossip core topics and synced, follow the installation and running commands below to initialize the light client.

### Installation & Running
```
git clone https://github.com/uink45/Beacon-Chain-Light-Client-Prototype.git
cd Beacon-Chain-Light-Client-Prototype/LightClientV2
dotnet build
dotnet run
```

### Known Issues
- When running the light client, sometimes it will display an error message `Error: Slot to process should be greater than current slot`. The light client will continue to function after this error, as it will re-submit the query to fetch a block with the latest slot.
