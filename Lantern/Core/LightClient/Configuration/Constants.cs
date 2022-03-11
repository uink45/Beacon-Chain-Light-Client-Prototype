using Nethermind.Core2.Types;

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
        public int NextSyncCommitteeDepth { get { return 5; } }
        public int CurrentSyncCommitteeIndex { get { return 22; } }
        public int CurrentSyncCommitteeDepth { get { return 5; } }
        public int SyncCommitteeSize { get { return 512; } }

        public class TimeParameters
        {
            public Epoch MaximumSeedLookahead { get; } = new Epoch((2 << 2) / 2);
            public Slot MinimumAttestationInclusionDelay { get; } = new Slot((2 << 0) / 2);
            public Epoch MinimumEpochsToInactivityPenalty { get; } = new Epoch((2 << 2) / 2);
            public Epoch MinimumSeedLookahead { get; } = new Epoch((2 << 0) / 2);
            public Epoch MinimumValidatorWithdrawabilityDelay { get; set; }
            public Epoch PersistentCommitteePeriod { get; set; }
            public ulong SecondsPerSlot { get; } = 12;
            public Slot SlotsPerEpoch { get; } = new Slot((2 << 5) / 2);
            public Slot SlotsPerEth1VotingPeriod { get; set; }
            public Epoch EpochsPerEth1VotingPeriod { get; } = new Epoch((2 << 6) / 2);
            public Slot SlotsPerHistoricalRoot { get; } = new Slot((2 << 13) / 2);
            public Epoch EpochsPerSyncCommitteePeriod { get; } = new Epoch((2 << 8) / 2);
            public Epoch UpdateTimeout { get; } = new Epoch((ulong)32 * 256);
            public ulong[] GenesisTime = { 1606824023, 1616508000 };
        }
    }
}
