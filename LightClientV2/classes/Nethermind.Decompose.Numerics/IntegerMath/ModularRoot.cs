using System;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        public static int ModularRoot(int a, int b, int c)
        {
            if (b == 2)
                return (int)ModularSquareRoot(a, c);
            throw new NotImplementedException();
        }

        public static uint ModularRoot(uint a, uint b, uint c)
        {
            if (b == 2)
                return (uint)ModularSquareRoot(a, c);
            throw new NotImplementedException();
        }

        public static long ModularRoot(long a, long b, long c)
        {
            if (b == 2)
                return (long)ModularSquareRoot(a, c);
            throw new NotImplementedException();
        }

        public static ulong ModularRoot(ulong a, ulong b, ulong c)
        {
            if (b == 2)
                return (ulong)ModularSquareRoot(a, c);
            throw new NotImplementedException();
        }

        public static BigInteger ModularRoot(BigInteger a, BigInteger b, BigInteger c)
        {
            if (b == 2)
                return ModularSquareRoot(a, c);
            throw new NotImplementedException();
        }
    }
}
