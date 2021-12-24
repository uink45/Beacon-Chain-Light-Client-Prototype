# Beacon Chain Light Client Prototype

This is a C# prototype implementation of the [Altair Minimal Light Client Specification](https://github.com/ethereum/consensus-specs/blob/dev/specs/altair/sync-protocol.md). 

### Functionality
Currently, the prototype is able to track the latest block header in the beacon chain. It achieves this by initializing from a trusted checkpoint root (using the Lodestar API) and verifies the headers of upcoming blocks using a known sync committee.

### Requirements
- .NET Core 5.0
- Visual Studio 2019 or above

### Before Running
To initialize and sync with the beacon chain, the light client uses Lodestar's API for fetching a snapshot. The snapshot contains a block header, public keys of the validators part of the current sync committee, and a merkle branch proof of the committee. If there is no snapshot available for a checkpoint root, the light client will not be able initialize. In order to check this, go to the [Lodestar Demo](https://light-client-demo.lodestar.casa/) and try initializing from a trusted checkpoint root. If it is able to sync without any errors, the light client can be started.  

### Installation & Running
```
git clone https://github.com/uink45/Beacon-Chain-Light-Client-Prototype.git
cd Beacon-Chain-Light-Client-Prototype/LightClientV2
dotnet build
dotnet run
```

### Known Issues
- When running the light client, sometimes it will display the an error message `Error: Slot to process should be greater than current slot`. The light client will continue to function after this error, as it will re-submit the query to fetch a block with the latest slot.








