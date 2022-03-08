using Nethermind.Core2.Crypto;
using System.Collections.Generic;

namespace Lantern
{
    public class LightClientProofs
    {        
        private Root leaf;
        private List<Root> proof;
        private ulong gindex;
        private long balance;

        public LightClientProofs()
        {
            leaf = Root.Zero;
            proof = new List<Root>();
            gindex = 0;
            balance = 0;
        }

        public LightClientProofs(Root _leaf, List<Root> _proof, ulong _gindex, long _balance)
        {
            leaf = _leaf;
            proof = _proof;
            gindex = _gindex;
            balance = _balance;
        }
        
        public Root Leaf { get { return leaf; } set { leaf = value; } }
        public List<Root> Proof { get { return proof; } set { proof = value; } }
        public ulong Gindex { get { return gindex; } set { gindex = value; } }
        public long Balance { get { return balance; } set { balance = value; } }
    }
}
