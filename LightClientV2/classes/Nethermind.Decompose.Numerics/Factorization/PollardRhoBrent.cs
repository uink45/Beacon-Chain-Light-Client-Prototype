using System;
using System.Numerics;
using System.Threading;

namespace Nethermind.Decompose.Numerics
{
    public class PollardRhoBrent : PollardRhoBase
    {
        const int batchSize = 100;

        public PollardRhoBrent(int threads, int iterations)
            : base(threads, iterations)
        {
        }

        protected override BigInteger Rho(BigInteger n, BigInteger xInit, BigInteger c, CancellationToken cancellationToken)
        {
            if (n.IsEven)
                return 2;

            var x = xInit;
            var y = xInit;
            var ys = y;
            var r = 1;
            var m = batchSize;
            var g = BigInteger.One;

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
                    var q = BigInteger.One;
                    for (int i = 0; i < limit; i++)
                    {
                        if (cancellationToken.IsCancellationRequested)
                            return BigInteger.Zero;
                        y = F(y, c, n);
                        q = q * (x - y) % n;
                    }
                    g = BigInteger.GreatestCommonDivisor(q, n);
                    k += limit;
                }
                r <<= 1;
            }
            while (g.IsOne);

            if (g == n)
            {
                do
                {
                    if (cancellationToken.IsCancellationRequested)
                        return BigInteger.Zero;
                    ys = F(ys, c, n);
                    g = BigInteger.GreatestCommonDivisor(x - ys, n);
                }
                while (g.IsOne);
            }

            return g;
        }
    }
}
