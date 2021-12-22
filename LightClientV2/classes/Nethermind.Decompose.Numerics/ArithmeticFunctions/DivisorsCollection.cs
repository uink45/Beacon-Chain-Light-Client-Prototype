using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public class DivisorsCollection
    {
        private int size;
        private byte[] divisors;

        public int Size { get { return size; } }

        public DivisorsCollection(int size)
        {
            this.size = size;
            divisors = new byte[size];
            for (int i = 1; i < size; i++)
            {
                for (int j = i; j < size; j += i)
                    ++divisors[j];
            }
        }

        public int this[int index]
        {
            get { return divisors[index]; }
        }
    }

}
