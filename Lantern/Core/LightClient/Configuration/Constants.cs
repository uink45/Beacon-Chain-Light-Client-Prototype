namespace Lantern
{
    /// <summary>
    /// Constants for sync protocol as specified in 
    /// https://github.com/ethereum/consensus-specs/blob/dev/specs/altair/sync-protocol.md. 
    /// </summary>
    public class Constants
    {
        public int MinSyncCommitteeParticipants { get { return 1; } }
        public int FinalizedRootGIndex { get { return 105; } }
        public int FinalizedRootDepth { get { return 6; } }
        public int FinalizedRootIndex { get { return 41; } }
        public int NextSyncCommitteeGIndex { get { return 55; } }
        public int NextSyncCommitteeIndex { get { return 23; } }
        public ulong ValidatorBalanceIndex { get { return 24189255811072; } }
        public int ValidatorBalanceDepth{ get { return 44; } }
        public int NextSyncCommitteeDepth { get { return 5; } }
        public int CurrentSyncCommitteeIndex { get { return 22; } }
        public int CurrentSyncCommitteeDepth { get { return 5; } }
        public int SyncCommitteeSize { get { return 512; } }
    }
}
