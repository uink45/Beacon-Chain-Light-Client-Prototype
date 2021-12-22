using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        public static int ModularProduct(int a, int b, int modulus)
        {
            return (int)((ulong)a * (ulong)b % (ulong)modulus);
        }

        public static uint ModularProduct(uint a, uint b, uint modulus)
        {
            return (uint)((ulong)a * (ulong)b % (ulong)modulus);
        }

        public static long ModularProduct(long a, long b, long modulus)
        {
            return (long)UInt64Helper.ModularProduct((ulong)a, (ulong)b, (ulong)modulus);
        }

        public static ulong ModularProduct(ulong a, ulong b, ulong modulus)
        {
            return UInt64Helper.ModularProduct(a, b, modulus);
        }

        public static UInt128 ModularProduct(UInt128 a, UInt128 b, UInt128 modulus)
        {
            return UInt128.ModMul(a, b, modulus);
        }

        public static BigInteger ModularProduct(BigInteger a, BigInteger b, BigInteger modulus)
        {
            return a * b % modulus;
        }
    }
}
