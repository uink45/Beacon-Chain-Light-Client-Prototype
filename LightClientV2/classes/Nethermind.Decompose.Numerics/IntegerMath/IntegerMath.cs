using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        private static int[] smallPrimesCached;

        private static int[] GetSmallPrimes()
        {
            if (smallPrimesCached == null)
                CachePrimes();
            return smallPrimesCached;
        }

        private static void CachePrimes()
        {
            smallPrimesCached = new SieveOfEratosthenes()
                .TakeWhile(p => p < 1000000)
                .ToArray();
        }

        public static int TwosComplement(int a)
        {
            return -a;
        }

        public static uint TwosComplement(uint a)
        {
            return 0 - a;
        }

        public static long TwosComplement(long a)
        {
            return -a;
        }

        public static ulong TwosComplement(ulong a)
        {
            return 0 - a;
        }

        public static Int128 TwosComplement(Int128 a)
        {
            return -a;
        }

        public static UInt128 TwosComplement(UInt128 a)
        {
            UInt128 c;
            UInt128.Negate(out c, ref a);
            return c;
        }

        public static int Abs(int a)
        {
            var flip = a >> 31;
            return (a ^ flip) - flip; 
        }

        public static uint Abs(uint a)
        {
            return a;
        }

        public static long Abs(long a)
        {
            var flip = a >> 63;
            return (a ^ flip) - flip;
        }

        public static ulong Abs(ulong a)
        {
            return a;
        }

        public static Int128 Abs(Int128 a)
        {
            return a.IsNegative ? -a : a;
        }

        public static UInt128 Abs(UInt128 a)
        {
            return a;
        }

        public static BigInteger Abs(BigInteger a)
        {
            return a.Sign != -1 ? a : -a;
        }

        public static int Min(int a, int b)
        {
            return a < b ? a : b;
        }

        public static uint Min(uint a, uint b)
        {
            return a < b ? a : b;
        }

        public static long Min(long a, long b)
        {
            return a < b ? a : b;
        }

        public static ulong Min(ulong a, ulong b)
        {
            return a < b ? a : b;
        }

        public static Int128 Min(Int128 a, Int128 b)
        {
            return Int128.Min(a, b);
        }

        public static UInt128 Min(UInt128 a, UInt128 b)
        {
            return UInt128.Min(a, b);
        }

        public static BigInteger Min(BigInteger a, BigInteger b)
        {
            return BigInteger.Min(a, b);
        }

        public static int Max(int a, int b)
        {
            return a > b ? a : b;
        }

        public static uint Max(uint a, uint b)
        {
            return a > b ? a : b;
        }

        public static long Max(long a, long b)
        {
            return a > b ? a : b;
        }

        public static ulong Max(ulong a, ulong b)
        {
            return a > b ? a : b;
        }

        public static Int128 Max(Int128 a, Int128 b)
        {
            return Int128.Max(a, b);
        }

        public static UInt128 Max(UInt128 a, UInt128 b)
        {
            return UInt128.Max(a, b);
        }

        public static BigInteger Max(BigInteger a, BigInteger b)
        {
            return BigInteger.Max(a, b);
        }

        public static int FloorQuotient(int a, int b)
        {
            return a / b;
        }

        public static BigInteger FloorQuotient(BigInteger a, BigInteger b)
        {
            return a / b;
        }

        public static int CeilingQuotient(int a, int b)
        {
            return (a + b - 1) / b;
        }

        public static BigInteger CeilingQuotient(BigInteger a, BigInteger b)
        {
            return (a + b - 1) / b;
        }

        public static int MultipleOfFloor(int a, int b)
        {
            return a / b * b;
        }

        public static BigInteger MultipleOfFloor(BigInteger a, BigInteger b)
        {
            return a / b * b;
        }

        public static int MultipleOfCeiling(int a, int b)
        {
            return (a + b - 1) / b * b;
        }

        public static BigInteger MultipleOfCeiling(BigInteger a, BigInteger b)
        {
            return (a + b - 1) / b * b;
        }

        public static int Modulus(int n, int p)
        {
            return (n % p + p) % p;
        }

        public static uint Modulus(uint n, uint p)
        {
            return n % p;
        }

        public static long Modulus(long n, long p)
        {
            var result = n % p;
            if (result < 0)
                result += p;
            return result;
        }

        public static ulong Modulus(ulong n, ulong p)
        {
            return n % p;
        }

        public static Int128 Modulus(Int128 n, Int128 p)
        {
            var result = n % p;
            if (result < 0)
                result += p;
            return result;
        }

        public static UInt128 Modulus(UInt128 n, UInt128 p)
        {
            return n % p;
        }

        public static int Modulus(BigInteger n, int p)
        {
            var result = (int)(n % p);
            if (result < 0)
                result += p;
            return result;
        }

        public static uint Modulus(BigInteger n, uint p)
        {
            var result = (long)(n % p);
            if (result < 0)
                result += p;
            return (uint)result;
        }

        public static long Modulus(BigInteger n, long p)
        {
            var result = (long)(n % p);
            if (result < 0)
                result += p;
            return result;
        }

        public static ulong Modulus(BigInteger n, ulong p)
        {
            if (n.Sign != -1)
                return (ulong)(n % p);
            var result = p - (ulong)(-n % p);
            if (result == p)
                result = 0;
            return result;
        }

        public static BigInteger Modulus(BigInteger n, BigInteger p)
        {
            var result = n % p;
            if (result.Sign == -1)
                result += p;
            return result;
        }

        public static BigInteger Modulus(Rational n, BigInteger p)
        {
            if (n.IsInteger)
                return IntegerMath.Modulus((BigInteger)n, p);
            return IntegerMath.ModularQuotient(n.Numerator, n.Denominator, p);
        }

        public static int GetDigitLength(BigInteger n, int b)
        {
            return (int)Math.Ceiling(BigInteger.Log(n, b));
        }

        public static bool IsPowerOfTwo(int a)
        {
            return (a & (a - 1)) == 0;
        }

        public static bool IsPowerOfTwo(uint a)
        {
            return (a & (a - 1)) == 0;
        }

        public static bool IsPowerOfTwo(long a)
        {
            return (a & (a - 1)) == 0;
        }

        public static bool IsPowerOfTwo(ulong a)
        {
            return (a & (a - 1)) == 0;
        }

        public static bool IsPowerOfTwo(Int128 a)
        {
            return a.IsPowerOfTwo;
        }

        public static bool IsPowerOfTwo(UInt128 a)
        {
            return a.IsPowerOfTwo;
        }

        public static bool IsPowerOfTwo(BigInteger a)
        {
            return a.IsPowerOfTwo;
        }
    }
}
