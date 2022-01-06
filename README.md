# Beacon Chain Light Client Prototype

This is a C# prototype implementation of the [Altair Minimal Light Client Specification](https://github.com/ethereum/consensus-specs/blob/dev/specs/altair/sync-protocol.md). 

### Functionality
Currently, the prototype can track the latest block header in the beacon chain. It achieves this by initializing from a trusted snapshot to know the current sync committee. After successfully initializing, it trustlessly verifies the latest block headers by checking if the sync committee signature is valid and that enough validators had signed. 

### Requirements
- .NET Core 5.0 or greater
- Visual Studio 2019 or above

### Before Running
To initialize and sync with the beacon chain, the light client requires a local server to send REST-API requests. This server is a modified version of the [Lodestar Beacon Chain Client](https://github.com/ChainSafe/lodestar) that was created by [Chainsafe](https://github.com/ChainSafe). It can be started by using the instructions in the GitHub repository. Once the server has subscribed to gossip core topics and synced, follow the instructions below to initialie the light client.

### Installation & Running
```
git clone https://github.com/uink45/Beacon-Chain-Light-Client-Prototype.git
cd Beacon-Chain-Light-Client-Prototype/LightClientV2
dotnet build
dotnet run
```

### Known Issues
- When running the light client, sometimes it will display an error message `Error: Slot to process should be greater than current slot`. The light client will continue to function after this error, as it will re-submit the query to fetch a block with the latest slot.
