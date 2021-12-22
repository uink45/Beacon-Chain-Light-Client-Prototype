
using Nethermind.Core2.Types;
namespace LightClientV2
{
    public class StateListLengths
    {
        public Epoch EpochsPerHistoricalVector { get; set; }
        public Epoch EpochsPerSlashingsVector { get; set; }
        public ulong HistoricalRootsLimit { get; set; }
        public ulong ValidatorRegistryLimit { get; set; }
    }
}
