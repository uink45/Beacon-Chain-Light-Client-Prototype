using System;
using Nethermind.Core2.Types;

namespace LightClientV2
{
    public class LocalClock
    {
        private readonly ulong GenesisTime;
        private readonly ulong SlotsPerEpoch;
        private readonly ulong EpochsPerSyncCommitteePeriod;
        private readonly ulong AltairForkEpoch;

        public LocalClock()
        {
            GenesisTime = 1606824023;
            SlotsPerEpoch = 32;
            EpochsPerSyncCommitteePeriod = 256;
            AltairForkEpoch = 74260;
        }
        public Slot CurrentSlot()
        {
            ulong timePassed = (ulong)DateTime.Now.Subtract(DateTime.MinValue.AddYears(1969)).TotalMilliseconds;
            ulong diffInSeconds = (timePassed / 1000) - GenesisTime;
            return new Slot(((ulong)Math.Floor((decimal)(diffInSeconds / 12))) - 3000);
        }

        public Epoch CurrentEpoch()
        {
            return new Epoch(CurrentSlot() / SlotsPerEpoch);
        }

        public Epoch EpochsInPeriod()
        {
            return new Epoch(CurrentEpoch() % EpochsPerSyncCommitteePeriod);
        }

        public ulong ComputeSyncPeriodAtEpoch()
        {
            return (ulong)((Math.Abs((decimal)(CurrentEpoch() - AltairForkEpoch)) / EpochsPerSyncCommitteePeriod));
        }

        public ulong SyncPeriodAtEpoch()
        {
            return (ulong)(CurrentEpoch() / EpochsPerSyncCommitteePeriod);
        }
    }
}
