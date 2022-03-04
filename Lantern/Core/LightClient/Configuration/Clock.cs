using System;
using Nethermind.Core2.Types;

namespace Lantern
{
    /// <summary>
    /// Local clock for the consensus layer.
    /// </summary>
    public class Clock
    {
        private readonly ulong EpochsPerSyncCommitteePeriod = 256;
        private readonly ulong SlotsPerEpoch = 32;
        private ulong[] GenesisTime = { 1606824023, 1616508000 };

        /// <summary>
        /// Calculates the number of slots
        /// since genesis time.
        /// </summary>
        public Slot CalculateSlot(int network)
        {
            ulong timePassed = (ulong)DateTime.UtcNow.Subtract(DateTime.MinValue.AddYears(1969)).TotalMilliseconds;
            ulong diffInSeconds = (timePassed / 1000) - GenesisTime[network];
            return new Slot(((ulong)Math.Floor((decimal)(diffInSeconds / 12))));
        }

        /// <summary>
        /// Calculates the number of epochs
        /// since genesis time.
        /// </summary>
        public Epoch CalculateEpoch(int network)
        {
            return new Epoch(CalculateSlot(network) / SlotsPerEpoch);
        }

        public Epoch CalculateEpochAtSlot(ulong slot, int network)
        {
            return new Epoch(slot / SlotsPerEpoch);
        }

        public ulong CalculateSyncPeriodAtEpoch(ulong epoch)
        {
            return epoch / EpochsPerSyncCommitteePeriod;
        }

        public ulong CalculateSyncPeriod(int network)
        {
            return CalculateEpoch(network) / EpochsPerSyncCommitteePeriod;
        }

        public Epoch CalculateRemainingEpochs(int network)
        {
            decimal currentSyncPeriod = (decimal)((ulong)CalculateEpoch(network)) / EpochsPerSyncCommitteePeriod;
            decimal nextSyncPeriod = ((CalculateEpoch(network) / EpochsPerSyncCommitteePeriod) + 1);
            decimal difference = nextSyncPeriod - currentSyncPeriod;
            decimal final = difference * EpochsPerSyncCommitteePeriod;
            return new Epoch((ulong)final);
        }
    }
}
