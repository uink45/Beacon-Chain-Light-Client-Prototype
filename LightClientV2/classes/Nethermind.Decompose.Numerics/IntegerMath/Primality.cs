using System.Linq;
using System.Numerics;
using System.Collections.Generic;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        private struct SmallDivisorBatch
        {
            public int Begin { get; set; }
            public int End { get; set; }
            public uint Modulus { get; set; }
        }
        private static SmallDivisorBatch[] SmallDivisorBatches;

        private static void CreateSmallDivisorBatches()
        {
            var smallPrimes = GetSmallPrimes();
            var n = 1;
            var batches = new List<SmallDivisorBatch>();
            while (n < 100)
            {
                var begin = n;
                var modulus = (uint)1;
                while (uint.MaxValue / modulus >= (uint)smallPrimes[n])
                    modulus *= (uint)smallPrimes[n++];
                var end = n;
                batches.Add(new SmallDivisorBatch { Begin = begin, End = end, Modulus = modulus });
            }
            SmallDivisorBatches = batches.ToArray();
        }

        public static int GetSmallDivisor(BigInteger n)
        {
            if (n.IsEven)
                return 2;
            var smallPrimes = GetSmallPrimes();
            if (SmallDivisorBatches == null)
                CreateSmallDivisorBatches();
            for (int j = 0; j < SmallDivisorBatches.Length; j++)
            {
                var begin = SmallDivisorBatches[j].Begin;
                var end = SmallDivisorBatches[j].End;
                var modulus = SmallDivisorBatches[j].Modulus;
                var value = (uint)(n % modulus);
                for (int i = begin; i < end; i++)
                {
                    if (value % (uint)smallPrimes[i] == 0)
                        return smallPrimes[i];
                }
            }
            return 1;
        }

        private static IPrimalityAlgorithm<uint> primalityInt = new TrialDivisionPrimality();

        public static bool IsPrime(int n)
        {
            return IsPrime((uint)n);
        }

        public static bool IsPrime(uint n)
        {
            return primalityInt.IsPrime(n);
        }

        private static IPrimalityAlgorithm<ulong> primalityLong = MillerRabin.Create(16, new UInt64MontgomeryReduction());

        public static bool IsPrime(long n)
        {
            return IsPrime((ulong)n);
        }

        public static bool IsPrime(ulong n)
        {
            if (n <= uint.MaxValue)
                return IsPrime((uint)n);
            return primalityLong.IsPrime(n);
        }

        private static IPrimalityAlgorithm<BigInteger> primalityBigInteger = MillerRabin.Create(16, new BigIntegerMontgomeryReduction());

        public static bool IsPrime(BigInteger n)
        {
            if (n <= ulong.MaxValue)
                return IsPrime((ulong)n);
            return primalityBigInteger.IsPrime(n);
        }

        public static bool IsProbablePrime(int n)
        {
            return IsProbablePrime((uint)n);
        }

        public static bool IsProbablePrime(uint n)
        {
            return ModularPowerOfTwo(n - 1, n) == 1;
        }

        public static bool IsProbablePrime(long n)
        {
            return IsProbablePrime((ulong)n);
        }

        public static bool IsProbablePrime(ulong n)
        {
            if ((n & 1) == 0)
                return n == 2;
            if (n <= uint.MaxValue)
                return IsProbablePrime((uint)n);
            return ModularPowerOfTwo(n - 1, n) == 1;
        }

        public static bool IsProbablePrime(BigInteger n)
        {
            return ModularPowerOfTwo(n - BigInteger.One, n).IsOne;
        }

        public static BigInteger NextPrime(BigInteger n)
        {
            if (n.IsEven)
                ++n;
            while (true)
            {
                if (GetSmallDivisor(n) == 1 && IsPrime(n))
                    return n;
                n += 2;
            }
        }
    }
}
