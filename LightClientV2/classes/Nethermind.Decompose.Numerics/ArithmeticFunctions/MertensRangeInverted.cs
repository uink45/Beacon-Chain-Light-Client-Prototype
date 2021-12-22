using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Threading;

namespace Nethermind.Decompose.Numerics
{
    public class MertensRangeInverted
    {
        private const long maximumBatchSize = (long)1 << 26;
        private const long minimumLowSize = (long)1 << 22;
        private const long C1 = 1;
        private const long C2 = 2;

        private int threads;
        private long nmax;
        private MobiusRange mobius;
        private long ulo;
        private long u;
        private sbyte[] values;
        private int[] mlo;
        private long sum2;
        private long sqrt;

        public MertensRangeInverted(long nmax, int threads)
            : this(new MobiusRange((long)IntegerMath.FloorPower((BigInteger)nmax, 2, 3) + 1, threads), nmax)
        {
        }

        public MertensRangeInverted(MobiusRange mobius, long nmax)
        {
            this.mobius = mobius;
            this.nmax = nmax;
            threads = mobius.Threads;

            sum2 = 0;
            var sqrt = IntegerMath.FloorSquareRoot(nmax);
            u = Math.Max((long)IntegerMath.FloorPower((BigInteger)nmax, 2, 3) * C1 / C2, sqrt + 1);
            ulo = Math.Max(Math.Min(u, maximumBatchSize), minimumLowSize);
            mlo = new int[ulo];
            values = new sbyte[ulo];
            mobius.GetValuesAndSums(1, ulo + 1, values, mlo, 0);
        }

        public long Evaluate(long n)
        {
            if (n <= 0)
                return 0;
            if (n > nmax)
                throw new ArgumentException("n");
            sqrt = IntegerMath.FloorSquareRoot(n);
            var imax = Math.Max(1, n / u);
            var mx = new long[imax + 1];
            ProcessBatch(mx, n, imax, mlo, 1, ulo);
            if (ulo < u)
            {
                var mhi = new int[maximumBatchSize];
                var m0 = mlo[ulo - 1];
                for (var x = ulo + 1; x <= u; x += maximumBatchSize)
                {
                    var xstart = x;
                    var xend = Math.Min(xstart + maximumBatchSize - 1, u);
                    m0 = mobius.GetSums(xstart, xend + 1, mhi, m0);
                    ProcessBatch(mx, n, imax, mhi, xstart, xend);
                }
            }
            return ComputeMx(mx, imax);
        }

        private void ProcessBatch(long[] mx, long n, long imax, int[] m, long x1, long x2)
        {
            if (threads <= 1)
                UpdateMx(mx, n, m, x1, x2, imax, 0, 1);
            else
            {
                var tasks = new Task[threads];
                for (var thread = 0; thread < threads; thread++)
                {
                    var min = thread;
                    var increment = threads;
                    tasks[thread] = Task.Factory.StartNew(() => UpdateMx(mx, n, m, x1, x2, imax, min, increment));
                }
                Task.WaitAll(tasks);
            }
        }

        private void UpdateMx(long[] mx, long n, int[] m, long x1, long x2, long imax, long min, long increment)
        {
            UpdateMxSmall(mx, n, m, x1, x2, imax, min, increment);
            UpdateMxLarge(mx, n, m, x1, x2, imax, 2 * min + 1, 2 * increment);
        }

        private void UpdateMxSmall(long[] mx, long n, int[] m, long x1, long x2, long imax, long min, long increment)
        {
            var kmin = Math.Max(1, x1) + min;
            var kmax = Math.Min(sqrt, x2);
            var s1 = (long)0;
            for (var k = kmin; k <= kmax; k += increment)
            {
                var ilast = IntegerMath.Min(imax, n / (k * k));
                var nk1 = n / k;
                var nk2 = n / (k + 1);
                while (ilast > 0 && nk2 / ilast < IntegerMath.FloorSquareRoot(n / ilast))
                    --ilast;
                ilast = DownToOdd(ilast);
                var s2 = (long)0;
                s2 += ISum1(nk1, nk2, 1, ref ilast);
                s2 += ISum2(nk1, nk2, 1, ilast);
                s1 += m[k - x1] * s2;
            }
            Interlocked.Add(ref sum2, s1);
        }

        private void UpdateMxLarge(long[] mx, long n, int[] m, long x1, long x2, long imax, long min, long increment)
        {
            for (var i = min; i <= imax; i += increment)
            {
                if (values[i - 1] == 0)
                    continue;

                var x = n / i;
                var sqrt = IntegerMath.FloorSquareRoot(x);
                var s = (long)0;

                var jmin = UpToOdd(Math.Max(imax / i + 1, x / (x2 + 1) + 1));
                var jmax = DownToOdd(Math.Min(sqrt, x / x1));
                s += JSum1(x, jmin, ref jmax, m, x1);
                s += JSum2(x, jmin, jmax, m, x1);

                mx[i] += s;
            }
        }

        private long ISum2(long nk1, long nk2, long imin, long ilast)
        {
            var s = (long)0;
            for (var i = imin; i <= ilast; i += 2)
                s += values[i - 1] * (T1Odd(nk1 / i) - T1Odd(nk2 / i));
            return s;
        }

        private long JSum2(long x, long jmin, long jmax, int[] m, long x1)
        {
            var s = (long)0;
            for (var j = jmin; j <= jmax; j += 2)
                s += m[x / j - x1];
            return s;
        }

        private long KSum2(long x, long kmin, long kmax, int[] m, long x1)
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

        private long ISum1(long nk1, long nk2, long imin, ref long i)
        {
            if (i <= 0)
                return 0;

            var s = (long)0;
            var beta1 = nk1 / (i + 2);
            var eps1 = nk1 % (i + 2);
            var delta1 = nk1 / i - beta1;
            var gamma1 = 2 * beta1 - i * delta1;
            var beta2 = nk2 / (i + 2);
            var eps2 = nk2 % (i + 2);
            var delta2 = nk2 / i - beta2;
            var gamma2 = 2 * beta2 - i * delta2;
            while (i >= imin)
            {
                eps1 += gamma1;
                if (eps1 >= i)
                {
                    ++delta1;
                    gamma1 -= i;
                    eps1 -= i;
                    if (eps1 >= i)
                    {
                        ++delta1;
                        gamma1 -= i;
                        eps1 -= i;
                        if (eps1 >= i)
                            break;
                    }
                }
                else if (eps1 < 0)
                {
                    --delta1;
                    gamma1 += i;
                    eps1 += i;
                }
                gamma1 += 4 * delta1;
                beta1 += delta1;

                eps2 += gamma2;
                if (eps2 >= i)
                {
                    ++delta2;
                    gamma2 -= i;
                    eps2 -= i;
                    if (eps2 >= i)
                    {
                        ++delta2;
                        gamma2 -= i;
                        eps2 -= i;
                        if (eps2 >= i)
                            break;
                    }
                }
                else if (eps2 < 0)
                {
                    --delta2;
                    gamma2 += i;
                    eps2 += i;
                }
                gamma2 += 4 * delta2;
                beta2 += delta2;

                s += values[i - 1] * (T1Odd(beta1) - T1Odd(beta2));
                i -= 2;
            }
            return s;
        }

        private long JSum1(long n, long j1, ref long j, int[] m, long offset)
        {
            var s = (long)0;
            var beta = n / (j + 2);
            var eps = n % (j + 2);
            var delta = n / j - beta;
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

                Debug.Assert(eps == n % j);
                Debug.Assert(beta == n / j);
                Debug.Assert(delta == beta - n / (j + 2));
                Debug.Assert(gamma == 2 * beta - (BigInteger)(j - 2) * delta);

                s += m[beta - offset];
                j -= 2;
            }
            return s;
        }

        private long KSum1(long n, long k1, ref long k, int[] m, long offset)
        {
            if (k == 0)
                return 0;

            var s = (long)0;
            var beta = n / (k + 1);
            var eps = n % (k + 1);
            var delta = n / k - beta;
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

                Debug.Assert(eps == n % k);
                Debug.Assert(beta == n / k);
                Debug.Assert(delta == beta - n / (k + 1));
                Debug.Assert(gamma == beta - (BigInteger)(k - 1) * delta);

                // Equivalent to:
                // s += (T1Odd(beta) - T1Odd(beta - delta)) * m[k];
                s += ((delta + (beta & 1)) >> 1) * m[k - offset];
                --k;
            }
            return s;
        }

        private long ComputeMx(long[] mx, long imax)
        {
            var s = (long)0;
            for (var i = 1; i <= imax; i += 2)
                s += values[i - 1] * mx[i];
            return -(s + sum2);
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
