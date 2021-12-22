
namespace LightClientV2
{
    public class Constants
    {
        private int minSynCommitteeParticipants = 1;

        private int finalizedRootGIndex = 105;

        private int finalizedRootDepth = 6;

        private int finalizedRootIndex = 41;

        private int nextSyncCommitteeGIndex = 55;

        private int nextSyncCommitteeIndex = 23;

        private int nextSyncCommitteeDepth = 5;

        private int currentSyncCommitteeIndex = 22;

        private int currentSyncCommitteeDepth = 5;

        private int syncCommitteeSize = (2 << 9) / 2;

        public int MinSyncCommitteeParticipants { get { return minSynCommitteeParticipants; } }
        public int FinalizedRootGIndex { get { return finalizedRootGIndex; } }
        public int FinalizedRootDepth { get { return finalizedRootDepth; } }
        public int FinalizedRootIndex { get { return finalizedRootIndex; } }
        public int NextSyncCommitteeGIndex { get { return nextSyncCommitteeGIndex; } }
        public int NextSyncCommitteeIndex { get { return nextSyncCommitteeIndex; } }
        public int NextSyncCommitteeDepth { get { return nextSyncCommitteeDepth; } }
        public int SyncCommitteeSize { get { return syncCommitteeSize; } }
        public int CurrentSyncCommitteeIndex { get { return currentSyncCommitteeIndex; } }
        public int CurrentSyncCommitteeDepth { get { return currentSyncCommitteeDepth; } }
    }
}
