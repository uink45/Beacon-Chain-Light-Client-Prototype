
namespace LightClientV2
{
    public class Constants
    {
        public readonly int MinSyncCommitteeParticipants = 1;

        public readonly int FinalizedRootGIndex = 105;

        public readonly int FinalizedRootDepth = 6;

        public readonly int FinalizedRootIndex = 41;

        public readonly int NextSyncCommitteeGIndex = 55;

        public readonly int NextSyncCommitteeIndex = 23;

        public readonly int NextSyncCommitteeDepth = 5;

        public readonly int CurrentSyncCommitteeIndex = 22;

        public readonly int CurrentSyncCommitteeDepth = 5;

        public readonly int SyncCommitteeSize = (2 << 9) / 2;
    }
}
