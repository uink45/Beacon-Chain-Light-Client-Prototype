using System;
using System.Collections.Generic;
using System.Numerics;
using System.Threading;

namespace Nethermind.Decompose.Numerics
{
    public class OldPollardRhoLong : IFactorizationAlgorithm<long>
    {
        const int batchSize = 100;
        private IRandomNumberAlgorithm<long> random = new MersenneTwister(0).Create<long>();

        public IEnumerable<long> Factor(long n)
        {
            if (n == 1)
            {
                yield return 1;
                yield break;
            }
            while (!IntegerMath.IsPrime(n))
            {
                var divisor = GetDivisor(n);
                if (divisor == 0 || divisor == 1)
                    yield break;
                foreach (var factor in Factor(divisor))
                    yield return factor;
                n /= divisor;
            }
            yield return n;
        }

        public long GetDivisor(long n)
        {
            var xInit = random.Next(n);
            var c = random.Next(n - 1) + 1;
            return Rho(n, xInit, c);
        }

        private long Rho(long n, long xInit, long c)
        {
            if ((n & 1) == 0)
                return 2;

            var x = xInit;
            var y = xInit;
            var ys = y;
            var r = 1;
            var m = batchSize;
            var g = (long)1;

            do
            {
                x = y;
                for (int i = 0; i < r; i++)
                    y = F(y, c, n);
                var k = 0;
                while (k < r && g == 1)
                {
                    ys = y;
                    var limit = Math.Min(m, r - k);
                    var q = (long)1;
                    for (int i = 0; i < limit; i++)
                    {
                        y = F(y, c, n);
                        q = IntegerMath.ModularProduct(q, x - y, n);
                    }
                    g = IntegerMath.GreatestCommonDivisor(q, n);
                    k += limit;
                }
                r <<= 1;
            }
            while (g == 1);

            if (g == n)
            {
                do
                {
                    ys = F(ys, c, n);
                    g = IntegerMath.GreatestCommonDivisor(x - ys, n);
                }
                while (g == 1);
            }

            return g;
        }

        protected static long F(long x, long c, long n)
        {
            return (IntegerMath.ModularProduct(x, x, n) + c) % n;
        }
    }
}
