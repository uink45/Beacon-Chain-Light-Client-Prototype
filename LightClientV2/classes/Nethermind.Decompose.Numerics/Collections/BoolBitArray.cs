using System.Collections.Generic;

namespace Nethermind.Decompose.Numerics
{
    public class BoolBitArray : List<bool>, IBitArray
    {
        public int Length
        {
            get { return Count; }
        }

        public BoolBitArray(int length)
        {
            for (int i = 0; i < length; i++)
                Add(false);
        }

        public IEnumerable<int> GetNonZeroIndices()
        {
            for (int i = 0; i < Count; i++)
            {
                if (this[i])
                    yield return i;
            }
        }
    }
}
