using System;
using System.Numerics;
using System.Threading;
using System.Diagnostics;

namespace Nethermind.Decompose.Numerics
{
    public class BigIntegerPollardRhoReduction : PollardRhoBase
    {
        const int batchSize = 100;
        IReductionAlgorithm<BigInteger> reduction;

        public BigIntegerPollardRhoReduction(int threads, int iterations, IReductionAlgorithm<BigInteger> reduction)
            : base(threads, iterations)
        {
            this.reduction = reduction;
        }

        protected override BigInteger Rho(BigInteger n, BigInteger xInit, BigInteger c, CancellationToken cancellationToken)
        {
            if (n.IsEven)
                return 2;

            var reducer = reduction.GetReducer(n);
            var x = reducer.ToResidue(xInit);
            var y = x.Copy();
            var ys = x.Copy();
            var r = 1;
            var m = batchSize;
            var cPrime = reducer.ToResidue(c);
            var one = reducer.ToResidue(BigInteger.One);
            var diff = one.Copy();
            var q = one.Copy();
            var g = BigInteger.One;
            int count = 0;

            do
            {
                x.Set(y);
                for (int i = 0; i < r; i++)
                    AdvanceF(y, cPrime);
                var k = 0;
                while (k < r && g.IsOne)
                {
                    ys.Set(y);
                    var limit = Math.Min(m, r - k);
                    q.Set(one);
                    for (int i = 0; i < limit; i++)
                    {
                        if (cancellationToken.IsCancellationRequested)
                            return BigInteger.Zero;
                        if (++count >= iterations)
                            return BigInteger.One;
                        AdvanceF(y, cPrime);
                        q.Multiply(diff.Set(x).Subtract(y));
                    }
                    g = BigInteger.GreatestCommonDivisor(q.Value, n);
                    k += limit;
                }
                r <<= 1;
            }
            while (g.IsOne);

            if (g.CompareTo(n) == 0)
            {
                // Backtrack.
                do
                {
                    if (cancellationToken.IsCancellationRequested)
                        return BigInteger.Zero;
                    AdvanceF(ys, cPrime);
                    g = BigInteger.GreatestCommonDivisor(diff.Set(x).Subtract(ys).Value, n);
                }
                while (g.IsOne);
            }

            if (g.CompareTo(n) == 0)
                return BigInteger.Zero;

            return g;
        }

        private static void AdvanceF(IResidue<BigInteger> x, IResidue<BigInteger> c)
        {
            x.Multiply(x).Add(c);
        }
    }
}
