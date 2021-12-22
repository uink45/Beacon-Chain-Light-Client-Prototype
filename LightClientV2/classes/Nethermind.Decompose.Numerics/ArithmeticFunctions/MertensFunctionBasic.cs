using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;
using System.Threading.Tasks;
using System.Diagnostics;

namespace Nethermind.Decompose.Numerics
{
    public class MertensFunctionBasic
    {
        private const long maximumBatchSize = (long)1 << 26;
        private const long C1 = 1;
        private const long C2 = 2;

        private int threads;
        private MobiusRange mobius;
        private long n;
        private long u;
        private long imax;
        private int[] m;
        private long[] mx;

        public MertensFunctionBasic(int threads)
        {
            this.threads = threads;
        }

        public long Evaluate(long n)
        {
            if (n <= 0)
                return 0;

            this.n = n;
            u = Math.Max((long)IntegerMath.FloorPower((BigInteger)n, 2, 3) * C1 / C2, IntegerMath.CeilingSquareRoot(n));
            imax = n / u;
            this.mobius = new MobiusRange(u + 1, threads);
            var batchSize = Math.Min(u, maximumBatchSize);
            m = new int[batchSize];
            mx = new long[imax + 1];

            var m0 = 0;
            for (var x = (long)1; x <= u; x += maximumBatchSize)
            {
                var xstart = x;
                var xend = Math.Min(xstart + maximumBatchSize - 1, u);
                m0 = mobius.GetSums(xstart, xend + 1, m, m0);
                ProcessBatch(xstart, xend);
            }
            ComputeMx();
            return mx[1];
        }

        private void ProcessBatch(long x1, long x2)
        {
            if (threads <= 1)
                UpdateMx(x1, x2, 1, 2);
            else
            {
                var tasks = new Task[threads];
                for (var thread = 0; thread < threads; thread++)
                {
                    var imin = 2 * thread + 1;
                    var increment = 2 * threads;
                    tasks[thread] = Task.Factory.StartNew(() => UpdateMx(x1, x2, imin, increment));
                }
                Task.WaitAll(tasks);
            }
        }

        private void UpdateMx(long x1, long x2, long imin, long increment)
        {
            for (var i = imin; i <= imax; i += increment)
            {
                var x = n / i;
                var sqrt = IntegerMath.FloorSquareRoot(x);
                var s = (long)0;

                var jmin = UpToOdd(Math.Max(imax / i + 1, x / (x2 + 1) + 1));
                var jmax = DownToOdd(Math.Min(sqrt, x / x1));
                s += JSum1(x, jmin, ref jmax, x1);
                s += JSum2(x, jmin, jmax, x1);

                var kmin = Math.Max(1, x1);
                var kmax = Math.Min(x / sqrt - 1, x2);
                s += KSum1(x, kmin, ref kmax, x1);
                s += KSum2(x, kmin, kmax, x1);

                mx[i] -= s;
            }
        }

        private long JSum2(long x, long jmin, long jmax, long x1)
        {
            var s = (long)0;
            for (var j = jmin; j <= jmax; j += 2)
                s += m[x / j - x1];
            return s;
        }

        private long KSum2(long x, long kmin, long kmax, long x1)
        {
            var s = (long)0;
            var current = T1Odd(x / kmin);
            for (var k = kmin; k <= kmax; k++)
            {
                var next = T1Odd(x / (k + 1));
                s += (current - next) * m[k - x1];
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

                s += m[beta - offset];
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
                s += ((delta + (beta & 1)) >> 1) * m[k - offset];
                --k;
            }
            return s;
        }

        private void ComputeMx()
        {
            for (var i = DownToOdd(imax); i >= 1; i -= 2)
            {
                var s = (long)0;
                var ijmax = imax / i * i;
                for (var ij = 2 * i; ij <= ijmax; ij += i)
                    s += mx[ij];
                mx[i] -= s;
            }
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
