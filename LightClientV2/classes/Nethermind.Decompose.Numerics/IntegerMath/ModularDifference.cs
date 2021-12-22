using System.Diagnostics;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        public static int ModularDifference(int a, int b, int modulus)
        {
            Debug.Assert(modulus > 0 && a >= 0 && a < modulus && b >= 0 && b < modulus);
            return a < b ? a + modulus - b : a - b;
        }

        public static uint ModularDifference(uint a, uint b, uint modulus)
        {
            Debug.Assert(modulus > 0 && a >= 0 && a < modulus && b >= 0 && b < modulus);
            return a < b ? (uint)((ulong)a + modulus - b) : a - b;
        }

        public static long ModularDifference(long a, long b, long modulus)
        {
            Debug.Assert(modulus > 0 && a >= 0 && a < modulus && b >= 0 && b < modulus);
            return a < b ? (long)((ulong)a + (ulong)modulus - (ulong)b) : a - b;
        }

        public static ulong ModularDifference(ulong a, ulong b, ulong modulus)
        {
            Debug.Assert(modulus > 0 && a >= 0 && a < modulus && b >= 0 && b < modulus);
            var sum = a - b;
            if (a < b)
                sum += modulus;
            return sum;
        }

        public static UInt128 ModularDifference(UInt128 a, UInt128 b, UInt128 modulus)
        {
            return UInt128.ModSub(a, b, modulus);
        }

        public static BigInteger ModularDifference(BigInteger a, BigInteger b, BigInteger modulus)
        {
            Debug.Assert(modulus > 0 && a >= 0 && a < modulus && b >= 0 && b < modulus);
            return a < b ? a + modulus - b : a - b;
        }
    }
}
