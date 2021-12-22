using System;

namespace Nethermind.Decompose.Numerics
{
    public class SimpleMobiusCollection
    {
        private const int squareSentinel = 128;
        private int size;
        private byte[] primeDivisors;

        public int Size { get { return size; } }

        public SimpleMobiusCollection(int size)
        {
            this.size = size;
            var limit = (int)Math.Ceiling(Math.Sqrt(size));
            primeDivisors = new byte[size];
            for (int i = 2; i < limit; i++)
            {
                if (primeDivisors[i] == 0)
                {
                    for (int j = i; j < size; j += i)
                        ++primeDivisors[j];
                    var iSquared = i * i;
                    for (int j = iSquared; j < size; j += iSquared)
                        primeDivisors[j] = squareSentinel;
                }
            }
            for (int i = limit; i < size; i++)
            {
                if (primeDivisors[i] == 0)
                {
                    for (int j = i; j < size; j += i)
                        ++primeDivisors[j];
                }
            }
        }

        public int this[int index]
        {
            get
            {
                var d = primeDivisors[index];
                if (d >= squareSentinel)
                    return 0;
                return ((~d & 1) << 1) - 1;
            }
        }
    }
}
