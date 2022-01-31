using Nethermind.Core2.Types;
namespace LightClientV2
{
    public class TimeParameters
    {
        public Epoch MaximumSeedLookahead { get; } = new Epoch((2 << 2) / 2);
        public Slot MinimumAttestationInclusionDelay { get; } = new Slot((2 << 0) / 2);
        public Epoch MinimumEpochsToInactivityPenalty { get; } = new Epoch((2 << 2) / 2);
        public Epoch MinimumSeedLookahead { get; } = new Epoch((2 << 0) / 2);
        public Epoch MinimumValidatorWithdrawabilityDelay { get; set; }
        public Epoch PersistentCommitteePeriod { get; set; }
        public ulong SecondsPerSlot { get; } = 12;
        public Slot SlotsPerEpoch { get; }  = new Slot((2 << 5) / 2);
        public Slot SlotsPerEth1VotingPeriod { get; set; }
        public Epoch EpochsPerEth1VotingPeriod { get; } = new Epoch((2 << 6) / 2);
        public Slot SlotsPerHistoricalRoot { get; } = new Slot((2 << 13) / 2);
        public Epoch EpochsPerSyncCommitteePeriod { get; } = new Epoch((2 << 8) / 2);
        public Epoch UpdateTimeout { get; } = new Epoch((ulong)32 * 256);
    }
}
