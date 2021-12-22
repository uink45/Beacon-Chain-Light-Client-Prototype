using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public class ShareableMutableIntegerStore : IStore<MutableInteger>
    {
        public MutableInteger Allocate()
        {
            return new MutableInteger(4);
        }

        public void Release(MutableInteger item)
        {
        }
    }
}
