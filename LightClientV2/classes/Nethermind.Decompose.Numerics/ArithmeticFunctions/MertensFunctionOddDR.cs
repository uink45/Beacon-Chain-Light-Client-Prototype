using System;
using System.Diagnostics;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;

namespace Nethermind.Decompose.Numerics
{
    public class MertensFunctionOddDR
    {
        private const long maximumBatchSize = (long)1 << 27;
        private const long C1 = 1;
        private const long C2 = 3;

        private int threads;
        private MobiusRange mobius;
        private MobiusOddRange mobiusOdd;
        private long n;
        private long u;
        private long imax;
        private sbyte[] mu;
        private int[] m;
        private long sum;
        private long mi1;

        public MertensFunctionOddDR(int threads)
        {
            this.threads = threads;
        }

        public long Evaluate(long n)
        {
            if (n <= 0)
                return 0;

            this.n = n;
            u = Math.Max((long)IntegerMath.FloorPower((BigInteger)n, 2, 3) * C1 / C2, IntegerMath.CeilingSquareRoot(n));
            u = DownToOdd(u);
            imax = n / u;
            this.mobius = new MobiusRange(imax + 1, threads);
            this.mobiusOdd = new MobiusOddRange(u + 2, threads);
            var batchSize = Math.Min(u + 1, maximumBatchSize);
            mu = new sbyte[imax];
            m = new int[batchSize >> 1];

            sum = 0;
            mobius.GetValues(1, imax + 1, mu);
            var m0 = 0;
            for (var x = (long)1; x <= u; x += maximumBatchSize)
            {
                var xstart = x;
                var xend = Math.Min(xstart + maximumBatchSize - 2, u);
                m0 = mobiusOdd.GetSums(xstart, xend + 2, m, m0);
                ProcessBatch(xstart, xend);
            }
            return mi1 - sum;
        }

        private void ProcessBatch(long x1, long x2)
        {
            if (threads <= 1)
                UpdateValue(x1, x2, 1, 2);
            else
            {
                var tasks = new Task[threads];
                for (var thread = 0; thread < threads; thread++)
                {
                    var imin = 2 * thread + 1;
                    var increment = 2 * threads;
                    tasks[thread] = Task.Factory.StartNew(() => UpdateValue(x1, x2, imin, increment));
                }
                Task.WaitAll(tasks);
            }
            if (imax >= x1 && imax <= x2)
                mi1 = m[(imax - x1) >> 1];
        }

        private void UpdateValue(long x1, long x2, long imin, long increment)
        {
            var s1 = (long)0;
            for (var i = imin; i <= imax; i += increment)
            {
                var mui = mu[i - 1];
                if (mui == 0)
                    continue;

                var x = n / i;
                var sqrt = IntegerMath.FloorSquareRoot(x);
                var xover = Math.Min(sqrt * 7 / 5, x); // 7/5 ~= sqrt(2)
                xover = x / (x / xover);
                var s2 = (long)0;

                var jmin = UpToOdd(Math.Max(imax / i + 1, x / (x2 + 1) + 1));
                var jmax = DownToOdd(Math.Min(xover, x / x1));
                s2 += JSum1(x, jmin, ref jmax, x1);
                s2 += JSum2(x, jmin, jmax, x1);

                var kmin = Math.Max(1, x1);
                var kmax = Math.Min(x / xover - 1, x2);
                s2 += KSum1(x, kmin, ref kmax, x1);
                s2 += KSum2(x, kmin, kmax, x1);

                s1 += mui * s2;
            }
            Interlocked.Add(ref sum, s1);
        }

        private long JSum2(long x, long jmin, long jmax, long x1)
        {
            var s = (long)0;
            for (var j = jmin; j <= jmax; j += 2)
                s += m[(x / j - x1) >> 1];
            return s;
        }

        private long KSum2(long x, long kmin, long kmax, long x1)
        {
            var s = (long)0;
            var current = T1Odd(x / kmin);
            for (var k = kmin; k <= kmax; k++)
            {
                var next = T1Odd(x / (k + 1));
                s += (current - next) * m[(k - x1) >> 1];
                current = next;
            }
            return s;
        }

        private long JSum1(long x, long j1, ref long j, long offset)
        {
            var s = (long)0;
            var beta = x / (j + 2);
            var eps = x % (j + 2);
            var delta = x / j - beta;
            var gamma = 2 * beta - j * delta;
            while (j >= j1)
            {
                eps += gamma;
                if (eps >= j)
                {
                    ++delta;
                    gamma -= j;
                    eps -= j;
                    if (eps >= j)
                    {
                        ++delta;
                        gamma -= j;
                        eps -= j;
                        if (eps >= j)
                            break;
                    }
                }
                else if (eps < 0)
                {
                    --delta;
                    gamma += j;
                    eps += j;
                }
                beta += delta;
                gamma += delta << 2;

                Debug.Assert(eps == x % j);
                Debug.Assert(beta == x / j);
                Debug.Assert(delta == beta - x / (j + 2));
                Debug.Assert(gamma == 2 * beta - (BigInteger)(j - 2) * delta);

                s += m[(beta - offset) >> 1];
                j -= 2;
            }
            return s;
        }

        private long KSum1(long x, long k1, ref long k, long offset)
        {
            if (k == 0)
                return 0;
            var s = (long)0;
            var beta = x / (k + 1);
            var eps = x % (k + 1);
            var delta = x / k - beta;
            var gamma = beta - k * delta;
            while (k >= k1)
            {
                eps += gamma;
                if (eps >= k)
                {
                    ++delta;
                    gamma -= k;
                    eps -= k;
                    if (eps >= k)
                    {
                        ++delta;
                        gamma -= k;
                        eps -= k;
                        if (eps >= k)
                            break;
                    }
                }
                else if (eps < 0)
                {
                    --delta;
                    gamma += k;
                    eps += k;
                }
                beta += delta;
                gamma += delta << 1;

                Debug.Assert(eps == x % k);
                Debug.Assert(beta == x / k);
                Debug.Assert(delta == beta - x / (k + 1));
                Debug.Assert(gamma == beta - (BigInteger)(k - 1) * delta);

                // Equivalent to:
                // s += (T1Odd(beta) - T1Odd(beta - delta)) * m[k];
                s += ((delta + (beta & 1)) >> 1) * m[(k - offset) >> 1];
                --k;
            }
            return s;
        }

        private long UpToOdd(long a)
        {
            return a | 1;
        }

        private long DownToOdd(long a)
        {
            return (a - 1) | 1;
        }

        private long T1Odd(long a)
        {
            return (a + (a & 1)) >> 1;
        }
    }
}
