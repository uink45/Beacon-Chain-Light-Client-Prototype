using System.Diagnostics;
using System.Numerics;
using System.Runtime.CompilerServices;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        public static int ModularSum(int a, int b, int modulus)
        {
            Debug.Assert(modulus > 0 && a >= 0 && a < modulus && b >= 0 && b < modulus);
            var sum = (uint)a + (uint)b;
            if (sum >= (uint)modulus)
                sum -= (uint)modulus;
            return (int)sum;
        }

        public static uint ModularSum(uint a, uint b, uint modulus)
        {
            Debug.Assert(modulus > 0 && a >= 0 && a < modulus && b >= 0 && b < modulus);
            var sum = (ulong)a + (ulong)b;
            if (sum >= (ulong)modulus)
                sum -= (ulong)modulus;
            return (uint)sum;
        }

        public static long ModularSum(long a, long b, long modulus)
        {
            Debug.Assert(modulus > 0 && a >= 0 && a < modulus && b >= 0 && b < modulus);
            var sum = (ulong)a + (ulong)b;
            if (sum >= (ulong)modulus)
                sum -= (ulong)modulus;
            return (long)sum;
        }

        public static ulong ModularSum(ulong a, ulong b, ulong modulus)
        {
            Debug.Assert(modulus > 0 && a >= 0 && a < modulus && b >= 0 && b < modulus);
            return ModularSumHelper(a + b, a, b, modulus);
        }

        private static ulong ModularSumHelper(ulong sum, ulong a, ulong b, ulong modulus)
        {
            // This is split into a separate method in order to trick the JIT compiler into inlining both of them.
            if (sum >= modulus || sum < a && sum < b)
                sum -= modulus;
            return sum;
        }

        public static UInt128 ModularSum(UInt128 a, UInt128 b, UInt128 modulus)
        {
            return UInt128.ModAdd(a, b, modulus);
        }

        public static BigInteger ModularSum(BigInteger a, BigInteger b, BigInteger modulus)
        {
            Debug.Assert(modulus > 0 && a >= 0 && a < modulus && b >= 0 && b < modulus);
            var sum = a + b;
            if (sum >= modulus)
                sum -= modulus;
            return sum;
        }
    }
}
