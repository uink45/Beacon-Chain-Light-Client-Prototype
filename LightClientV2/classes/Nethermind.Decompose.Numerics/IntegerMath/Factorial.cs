using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        public static int Factorial(int n)
        {
            return (int)Factorial((uint)n);
        }

        public static uint Factorial(uint n)
        {
            var result = (uint)1;
            for (var i = (uint)2; i <= n; i++)
                result *= i;
            return result;
        }

        public static long Factorial(long n)
        {
            return (long)Factorial((ulong)n);
        }

        public static ulong Factorial(ulong n)
        {
            var result = (ulong)1;
            for (var i = (ulong)2; i <= n; i++)
                result *= i;
            return result;
        }

        public static BigInteger Factorial(BigInteger n)
        {
            return FactorialCore((int)n);
        }

        private static BigInteger FactorialCore(int n)
        {
            var result = BigInteger.One;
            for (var i = 2; i <= n; i++)
                result *= i;
            return result;
        }
    }
}
