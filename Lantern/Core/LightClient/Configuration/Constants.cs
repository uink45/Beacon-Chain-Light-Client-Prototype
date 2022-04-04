using Nethermind.Core2.Types;
using Nethermind.Core2.Crypto;

namespace Lantern
{
    /// <summary>
    /// Constants for the light client.
    /// </summary>
    public class Constants
    {
        public readonly int MinSyncCommitteeParticipants = 1;
        public readonly int FinalizedRootGIndex = 105;
        public readonly int FinalizedRootDepth = 6;
        public readonly int FinalizedRootIndex = 41;
        public readonly int NextSyncCommitteeIndex = 23;
        public readonly int NextSyncCommitteeDepth = 5;
        public readonly int CurrentSyncCommitteeIndex = 22;
        public readonly int CurrentSyncCommitteeDepth = 5;
        public readonly int SyncCommitteeSize = 512;

        public readonly ForkVersion[] ForkVersions = { new LightClientUtility().ToObject("0x01000000", "ForkVersion"), new LightClientUtility().ToObject("0x01001020", "ForkVersion") };
        public readonly Root[] GenesisRoots = { new LightClientUtility().ToObject("0x4b363db94e286120d76eb905340fdd4e54bfe9f06bf33ff6cf5ad27f511bfe95", "Root"), new LightClientUtility().ToObject("0x043db0d9a83813551ee2f33450d23797757d430911a9320530ad8a0eabc43efb", "Root") };

        public readonly Epoch UpdateTimeout = new Epoch((ulong)32 * 256);
        public readonly Slot SlotsPerEpoch = new Slot((2 << 5) / 2);
        public readonly ulong EpochsPerSyncCommitteePeriod = new Epoch(256);
        public readonly ulong[] GenesisTime = { 1606824023, 1616508000 };
        public readonly ulong SecondsPerSlot = 12;
    }
}
