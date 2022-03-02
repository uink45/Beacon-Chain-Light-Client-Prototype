using Nethermind.Core2.Crypto;
using System.Collections.Generic;

namespace Lantern
{
    public class LightClientProofs
    {
        private List<int> offsets;
        private List<Root> leaves;
        private long balance;

        public LightClientProofs()
        {
            offsets = new List<int>();
            leaves = new List<Root>();
            balance = 0;
        }

        public LightClientProofs(List<int> _offsets, List<Root> _leaves, long _value)
        {
            offsets = _offsets;
            leaves = _leaves;
            balance = _value;
        }

        public List<int> Offsets { get { return offsets; } set { offsets = value; } }
        public List<Root> Leaves { get { return leaves; } set { leaves = value; } }
        public long Balance { get { return balance; } set { balance = value; } }
    }
}
