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
        private readonly ulong AltairForkEpoch = 74260;
        private readonly ulong SlotsPerEpoch = 32;
        private ulong[] GenesisTime = { 1606824023, 1616508000 };

        /// <summary>
        /// Calculates the number of slots
        /// since genesis time.
        /// </summary>
        public Slot CalculateSlot(int network)
        {
            ulong timePassed = (ulong)DateTime.Now.Subtract(DateTime.MinValue.AddYears(1969)).TotalMilliseconds;
            ulong diffInSeconds = (timePassed / 1000) - GenesisTime[network];
            return new Slot(((ulong)Math.Floor((decimal)(diffInSeconds / 12))) - 3000);
        }

        /// <summary>
        /// Calculates the number of epochs
        /// since genesis time.
        /// </summary>
        public Epoch CalculateEpoch(int network)
        {
            return new Epoch(CalculateSlot(network) / SlotsPerEpoch);
        }


        // FIX THE FOLLOWING SUMMARIES

        /// <summary>
        /// Calculates the number of epochs 
        /// that have passed in the current
        /// sync period. 
        /// </summary>
        public Epoch CalculateEpochsInSyncPeriod(int network)
        {
            return new Epoch(CalculateEpoch(network) % EpochsPerSyncCommitteePeriod);
        }

        public ulong CalculateSyncPeriod(int network)
        {
            return (ulong)((Math.Abs((decimal)(CalculateEpoch(network) - AltairForkEpoch)) / EpochsPerSyncCommitteePeriod));
        }

        public ulong CalculateRemainingSyncPeriod(int network)
        {
            return CalculateEpoch(network) / EpochsPerSyncCommitteePeriod;
        }
    }
}
