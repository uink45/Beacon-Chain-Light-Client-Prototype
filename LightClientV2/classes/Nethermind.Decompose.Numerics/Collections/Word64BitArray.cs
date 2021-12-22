using System.Collections;
using System.Collections.Generic;
using Word = System.Int64;

namespace Nethermind.Decompose.Numerics
{
    public class Word64BitArray : IBitArray
    {
        private const int wordShift = 6;
        private const int wordLength = 1 << wordShift;
        private const int wordMask = wordLength - 1;

        private int length;
        private int words;
        private Word[] bits;

        public int Length
        {
            get { return length; }
        }

        public Word64BitArray(int length)
        {
            this.length = length;
            words = (int)(((long)length + wordLength - 1) / wordLength);
            bits = new Word[words];
        }

        public bool this[int j]
        {
            get
            {
                return (bits[j >> wordShift] & (Word)1 << (j & wordMask)) != 0;
            }
            set
            {
                if (value)
                    bits[j >> wordShift] |= (Word)1 << (j & wordMask);
                else
                    bits[j >> wordShift] &= ~((Word)1 << (j & wordMask));
            }
        }

        public IEnumerable<int> GetNonZeroIndices()
        {
            for (int i = 0; i < length; i++)
            {
                if (this[i])
                    yield return i;
            }
        }

        public IEnumerator<bool> GetEnumerator()
        {
            for (int i = 0; i < length; i++)
                yield return this[i];
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public override string ToString()
        {
            return string.Format("Length = {0}", Length);
        }
    }
}
