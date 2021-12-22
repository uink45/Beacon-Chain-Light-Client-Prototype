using System;
using Nethermind.Core2.Types;
namespace LightClientV2
{
    public class TimeParameters
    {

        public TimeParameters()
        {
            MinimumAttestationInclusionDelay = new Slot((2 << 0)/2);
            SlotsPerEpoch = new Slot((2 << 5) / 2);
            MinimumSeedLookahead = new Epoch((2 << 0) / 2);
            MaximumSeedLookahead = new Epoch((2 << 2) / 2);
            MinimumEpochsToInactivityPenalty = new Epoch((2 << 2) / 2);
            EpochsPerEth1VotingPeriod = new Epoch((2 << 6) / 2);
            SlotsPerHistoricalRoot = new Slot((2 << 13) / 2);
            EpochsPerSyncCommitteePeriod = new Epoch((2 << 8) / 2);
            UpdateTimeout = new Epoch((ulong)SlotsPerEpoch * EpochsPerSyncCommitteePeriod);
        }

        public Epoch MaximumSeedLookahead { get; set; }
        public Slot MinimumAttestationInclusionDelay { get; set; }
        public Epoch MinimumEpochsToInactivityPenalty { get; set; }
        public Epoch MinimumSeedLookahead { get; set; }
        public Epoch MinimumValidatorWithdrawabilityDelay { get; set; }
        public Epoch PersistentCommitteePeriod { get; set; }
        public ulong SecondsPerSlot { get; set; }
        public Slot SlotsPerEpoch { get; set; }
        public Slot SlotsPerEth1VotingPeriod { get; set; }
        public Epoch EpochsPerEth1VotingPeriod { get; set; }
        public Slot SlotsPerHistoricalRoot { get; set; }
        public Epoch EpochsPerSyncCommitteePeriod { get; set; }
        public Epoch UpdateTimeout { get; set; }
    }
}
