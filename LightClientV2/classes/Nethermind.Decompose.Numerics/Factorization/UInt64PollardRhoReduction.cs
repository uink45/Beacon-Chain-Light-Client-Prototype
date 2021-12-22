using System;
using System.Collections.Generic;
using System.Numerics;
using System.Threading;

namespace Nethermind.Decompose.Numerics
{
    public class UInt64PollardRhoReduction : IFactorizationAlgorithm<long>, IFactorizationAlgorithm<ulong>
    {
        const int batchSize = 100;
        private IRandomNumberAlgorithm<ulong> random = new MersenneTwister(0).Create<ulong>();
        private IReductionAlgorithm<ulong> reduction;

        public UInt64PollardRhoReduction(IReductionAlgorithm<ulong> reduction)
        {
            this.reduction = reduction;
        }

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

        public IEnumerable<ulong> Factor(ulong n)
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
            return (long)GetDivisor((ulong)n);
        }

        public ulong GetDivisor(ulong n)
        {
            var xInit = random.Next(n);
            var c = random.Next(n - 1) + 1;
            var reducer = reduction.GetReducer(n);
            return Rho(n, xInit, c, reducer);
        }

        private ulong Rho(ulong n, ulong xInit, ulong c, IReducer<ulong> reducer)
        {
            if ((n & 1) == 0)
                return 2;

            var x = reducer.ToResidue(xInit);
            var y = x.Copy();
            var ys = x.Copy();
            var r = 1;
            var m = batchSize;
            var cPrime = reducer.ToResidue(c);
            var one = reducer.ToResidue(1);
            var diff = one.Copy();
            var q = one.Copy();
            var g = (ulong)1;

            do
            {
                x.Set(y);
                for (int i = 0; i < r; i++)
                    AdvanceF(y, cPrime);
                var k = 0;
                while (k < r && g == 1)
                {
                    ys.Set(y);
                    var limit = Math.Min(m, r - k);
                    q.Set(one);
                    for (int i = 0; i < limit; i++)
                    {
                        AdvanceF(y, cPrime);
                        q.Multiply(diff.Set(x).Subtract(y));
                    }
                    g = IntegerMath.GreatestCommonDivisor(q.Value, n);
                    k += limit;
                }
                r <<= 1;
            }
            while (g == 1);

            if (g.CompareTo(n) == 0)
            {
                // Backtrack.
                do
                {
                    AdvanceF(ys, cPrime);
                    g = IntegerMath.GreatestCommonDivisor(diff.Set(x).Subtract(ys).Value, n);
                }
                while (g == 1);
            }

            if (g.CompareTo(n) == 0)
                return 0;

            return g;
        }

        private static void AdvanceF(IResidue<ulong> x, IResidue<ulong> c)
        {
            x.Multiply(x).Add(c);
        }
    }
}
