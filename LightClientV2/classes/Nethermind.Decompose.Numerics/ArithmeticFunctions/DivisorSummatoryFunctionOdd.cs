using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class DivisorSummatoryFunctionOdd : IDivisorSummatoryFunction<ulong>, IDivisorSummatoryFunction<UInt128>, IDivisorSummatoryFunction<BigInteger>
    {
        private const ulong maxUInt64 = (ulong)1 << 60;
        private readonly BigInteger maxUInt128 = (BigInteger)1 << 96;

        private IDivisorSummatoryFunction<ulong> hyperbolicSumUInt64;
        private IDivisorSummatoryFunction<UInt128> hyperbolicSumUInt128;
        private IDivisorSummatoryFunction<BigInteger> hyperbolicSumBigInteger;

        public DivisorSummatoryFunctionOdd(int threads, bool mod2)
        {
            hyperbolicSumUInt64 = new DivisorSummatoryFunctionOddUInt64(threads, mod2);
            hyperbolicSumUInt128 = new DivisorSummatoryFunctionOddUInt128(threads, mod2);
            hyperbolicSumBigInteger = new DivisorSummatoryFunctionOddBigInteger(threads);
        }

        public ulong Evaluate(ulong n)
        {
            return hyperbolicSumUInt64.Evaluate((ulong)n);
        }

        public ulong Evaluate(ulong n, ulong x1, ulong x2)
        {
            return hyperbolicSumUInt64.Evaluate((ulong)n, (ulong)x1, (ulong)x2);
        }

        public UInt128 Evaluate(UInt128 n)
        {
            if (n <= maxUInt64)
                return hyperbolicSumUInt64.Evaluate((ulong)n);
            return hyperbolicSumUInt128.Evaluate((UInt128)n);
        }

        public UInt128 Evaluate(UInt128 n, UInt128 x1, UInt128 x2)
        {
            if (n <= maxUInt64)
                return hyperbolicSumUInt64.Evaluate((ulong)n, (ulong)x1, (ulong)x2);
            return hyperbolicSumUInt128.Evaluate((UInt128)n, (UInt128)x1, (UInt128)x2);
        }

        public BigInteger Evaluate(BigInteger n)
        {
            if (n <= maxUInt64)
                return hyperbolicSumUInt64.Evaluate((ulong)n);
            if (n <= maxUInt128)
                return hyperbolicSumUInt128.Evaluate((UInt128)n);
            return hyperbolicSumBigInteger.Evaluate(n);
        }

        public BigInteger Evaluate(BigInteger n, BigInteger x1, BigInteger x2)
        {
            if (n <= maxUInt64)
                return hyperbolicSumUInt64.Evaluate((ulong)n, (ulong)x1, (ulong)x2);
            if (n <= maxUInt128)
                return hyperbolicSumUInt128.Evaluate((UInt128)n, (UInt128)x1, (UInt128)x2);
            return hyperbolicSumBigInteger.Evaluate(n);
        }
    }
}
