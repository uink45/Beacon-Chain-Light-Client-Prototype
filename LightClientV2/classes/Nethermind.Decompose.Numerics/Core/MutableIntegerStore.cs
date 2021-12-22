using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public class MutableIntegerStore : IStore<MutableInteger>
    {
        private int length;
        private Stack<MutableInteger> freeList;

        public MutableIntegerStore(int length)
        {
            this.length = length;
            this.freeList = new Stack<MutableInteger>();
        }

        public MutableInteger Allocate()
        {
            if (freeList.Count != 0)
                return freeList.Pop();
            return new MutableInteger(length);
        }

        public void Release(MutableInteger a)
        {
            freeList.Push(a);
        }
    }
}
