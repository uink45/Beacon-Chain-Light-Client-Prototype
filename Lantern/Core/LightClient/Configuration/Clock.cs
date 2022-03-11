using System;
using Nethermind.Core2.Types;

namespace Lantern
{
    /// <summary>
    /// Local clock for the consensus layer.
    /// </summary>
    public class Clock
    {
        /// <summary>
        /// Calculates the number of slots
        /// since genesis time.
        /// </summary>
        public Slot CalculateSlot(int network)
        {
            ulong timePassed = (ulong)DateTime.UtcNow.Subtract(DateTime.MinValue.AddYears(1969)).TotalMilliseconds;
            ulong diffInSeconds = (timePassed / 1000) - new Constants.TimeParameters().GenesisTime[network];
            return new Slot(((ulong)Math.Floor((decimal)(diffInSeconds / 12))));
        }

        /// <summary>
        /// Calculates the number of epochs
        /// since genesis time.
        /// </summary>
        public Epoch CalculateEpoch(int network)
        {
            return new Epoch(CalculateSlot(network) / new Constants.TimeParameters().SlotsPerEpoch);
        }

        public Epoch CalculateEpochAtSlot(ulong slot, int network)
        {
            return new Epoch(slot / new Constants.TimeParameters().SlotsPerEpoch);
        }

        public ulong CalculateSyncPeriodAtEpoch(ulong epoch)
        {
            return epoch / new Constants.TimeParameters().EpochsPerSyncCommitteePeriod;
        }

        public ulong CalculateSyncPeriod(int network)
        {
            return CalculateEpoch(network) / (ulong)new Constants.TimeParameters().EpochsPerSyncCommitteePeriod;
        }

    }
}
