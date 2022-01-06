using System;
using Nethermind.Core2.Types;

namespace LightClientV2
{
    public class LocalClock
    {
        private readonly ulong GenesisTime;

        public LocalClock()
        {
            GenesisTime = 1606824023;
        }
        public Slot GetCurrentSlot()
        {
            ulong timePassed = (ulong)DateTime.Now.Subtract(DateTime.MinValue.AddYears(1969)).TotalMilliseconds;
            ulong diffInSeconds = timePassed / 1000 - GenesisTime;
            return new Slot((ulong)Math.Floor((decimal)(diffInSeconds / 12)));
        }
    }
}
