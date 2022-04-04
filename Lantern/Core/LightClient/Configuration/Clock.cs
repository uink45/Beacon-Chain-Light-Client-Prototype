using System;
using Nethermind.Core2.Types;

namespace Lantern
{
    public class Clock
    {
        public ulong CalculateSlot(int network)
        {
            ulong timePassed = (ulong)DateTime.UtcNow.Subtract(DateTime.MinValue.AddYears(1969)).TotalSeconds;
            ulong diffInSeconds = timePassed - new Constants().GenesisTime[network];
            return (ulong)Math.Floor((decimal)(diffInSeconds / 12));
        }

        public ulong CalculateEpoch(int network)
        {
            return CalculateSlot(network) / new Constants().SlotsPerEpoch;
        }

        public ulong CalculateEpochAtSlot(ulong slot)
        {
            return slot / new Constants().SlotsPerEpoch;
        }

        public ulong CalculateSyncPeriodAtEpoch(ulong epoch)
        {
            return epoch / new Constants().EpochsPerSyncCommitteePeriod;
        }

        public ulong CalculateSyncPeriod(int network)
        {
            return CalculateEpoch(network) / new Constants().EpochsPerSyncCommitteePeriod;
        }

    }
}
