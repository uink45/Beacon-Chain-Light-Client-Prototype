using System;
using Nethermind.Core2.Types;

namespace LightClientV2
{
    public class LocalClock
    {
        private readonly ulong GenesisTime;
        private readonly ulong SlotsPerEpoch;
        private readonly ulong EpochsPerSyncCommitteePeriod;

        public LocalClock()
        {
            GenesisTime = 1606824023;
            SlotsPerEpoch = 32;
            EpochsPerSyncCommitteePeriod = 256;
        }
        public Slot GetCurrentSlot()
        {
            ulong timePassed = (ulong)DateTime.Now.Subtract(DateTime.MinValue.AddYears(1969)).TotalMilliseconds;
            ulong diffInSeconds = (timePassed / 1000) - GenesisTime;
            return new Slot(((ulong)Math.Floor((decimal)(diffInSeconds / 12))) - 3000);
        }

        public Epoch GetCurrentEpoch()
        {
            return new Epoch((ulong)GetCurrentSlot() / SlotsPerEpoch);
        }

        public Epoch EpochsInPeriod()
        {
            return new Epoch((ulong)GetCurrentEpoch() % EpochsPerSyncCommitteePeriod);
        }
    }
}
