using System.Numerics;
using System.Threading;

namespace Nethermind.Decompose.Numerics
{
    public class PollardRho : PollardRhoBase
    {
        const int batchSize = 100;

        public PollardRho(int threads, int iterations)
            : base(threads, iterations)
        {
        }

        protected override BigInteger Rho(BigInteger n, BigInteger xInit, BigInteger c, CancellationToken cancellationToken)
        {
            if (n.IsEven)
                return 2;

            var x = xInit;
            var y = xInit;

            var divisor = BigInteger.One;
            var x0 = x;
            var y0 = y;
            do
            {
                var z = BigInteger.One;
                x0 = x;
                y0 = y;
                for (int i = 0; i < batchSize; i++)
                {
                    if (cancellationToken.IsCancellationRequested)
                        return BigInteger.Zero;
                    x = F(x, c, n);
                    y = F(y, c, n);
                    y = F(y, c, n);
                    z = z * (x - y) % n;
                }
                divisor = BigInteger.GreatestCommonDivisor(z, n);
            }
            while (divisor.IsOne);

            if (divisor == n)
            {
                x = x0;
                y = y0;
                do
                {
                    if (cancellationToken.IsCancellationRequested)
                        return BigInteger.Zero;
                    x = F(x, c, n);
                    y = F(y, c, n);
                    y = F(y, c, n);
                    divisor = BigInteger.GreatestCommonDivisor(y - x, n);
                }
                while (divisor.IsOne);
            }

            return divisor;
        }
    }
}
