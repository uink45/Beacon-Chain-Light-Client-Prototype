# Beacon Chain Light Client Prototype

This is a prototype C# implementation of the [Altair Minimal Light Client Specification](https://github.com/ethereum/consensus-specs/blob/dev/specs/altair/sync-protocol.md). 

### Functionality
Currently, the prototype is able to track the latest block header in the beacon chain. It achieves this by initializing from a trusted checkpoint root (using the Lodestar API) and verifies the headers of upcoming blocks using a known sync committee.

### Requirements
- .NET Core 5.0
- Visual Studio 2019 or above

### Installation & Running
```
git clone https://github.com/uink45/Beacon-Chain-Light-Client-Prototype.git
cd Beacon-Chain-Light-Client-Prototype
cd LightClientV2
dotnet build
dotnet run
```

### Known Issues
- When running the light client, sometimes it will display the following error message `Slot must be greater than ...`. The light client will continue to function after this error, as it will re-submit the query to fetch a block with the latest slot.








