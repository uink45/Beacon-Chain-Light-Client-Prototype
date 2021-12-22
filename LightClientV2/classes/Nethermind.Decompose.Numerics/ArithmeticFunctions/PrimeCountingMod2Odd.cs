using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Numerics;
using System.Threading.Tasks;
using System.Linq;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class PrimeCountingMod2Odd
    {
        private const int mobiusBatchSize = 1 << 26;
        private const int divisorBatchSize = 1 << 20;
        private const int smallCutoff = 10;
        private const long C1 = 1;
        private const long C2 = 1;
        private const long C3 = 1;
        private const long C4 = 1;

        private int threads;
        private UInt128 n;
        private long sqrtn;
        private long kmax;
        private long imax;
        private long xmed;
        private long xmax;
        private MobiusOddRangeAdditive mobius;
        private DivisorOddRangeAdditive divisors;
        private long[] xi;
        private long[] mx;
        private int m0;
        private sbyte[] values;
        private int[] m;
        private long d1;
        private long d2;
        private ulong[] dsums;

        private IDivisorSummatoryFunction<UInt128>[] hyperbolicSum;
        private IDivisorSummatoryFunction<UInt128> hyperbolicSumParallel;

        public PrimeCountingMod2Odd(int threads)
        {
            this.threads = threads;
            var count = Math.Max(threads, 1);
            hyperbolicSum = new IDivisorSummatoryFunction<UInt128>[count];
            for (var i = 0; i < count; i++)
                hyperbolicSum[i] = new DivisorSummatoryFunctionOdd(0, true);
            hyperbolicSumParallel = new DivisorSummatoryFunctionOdd(threads, true);
        }

        public int Evaluate(BigInteger n)
        {
            return Evaluate((UInt128)n);
        }

        public int Evaluate(UInt128 n)
        {
            this.n = n;
            var sum = 0;
            sqrtn = (long)IntegerMath.FloorSquareRoot(n);
            kmax = (int)IntegerMath.FloorLog(n, 2);
            imax = (long)IntegerMath.FloorPower(n, 1, 5) * C1 / C2;
            xmax = DownToOdd(imax != 0 ? Xi(imax) : sqrtn);
            xmed = DownToOdd(Math.Min((long)(IntegerMath.FloorPower(n, 2, 7) * C3 / C4), xmax));
            var dmax = (long)IntegerMath.Min(n / IntegerMath.Square((UInt128)xmed) + 1, n);
            mobius = new MobiusOddRangeAdditive((xmax + 2) | 1, threads);
            divisors = new DivisorOddRangeAdditive((dmax + 2) | 1, threads);
            xi = new long[imax + 1];
            mx = new long[imax + 1];

            // Initialize xi.
            for (var i = 1; i <= imax; i++)
                xi[i] = Xi(i);

            values = new sbyte[mobiusBatchSize >> 1];
            m = new int[mobiusBatchSize >> 1];
            m0 = 0;
            dsums = new ulong[divisorBatchSize >> 1];
            d1 = d2 = 1;

            // Process small x values.
            for (var x = (long)1; x <= xmed; x += mobiusBatchSize)
            {
                var xfirst = x;
                var xlast = Math.Min(xmed, xfirst + mobiusBatchSize - 2);
                m0 = mobius.GetValuesAndSums(xfirst, xlast + 2, values, m, m0);
                sum += Pi2Small(xfirst, xlast);
                UpdateMx(xfirst, xlast);
            }

            // Process medium x values.
#if true
            for (var x = xmed + 2; x <= xmax; x += mobiusBatchSize)
            {
                var xfirst = x;
                var xlast = Math.Min(xmax, xfirst + mobiusBatchSize - 2);
                m0 = mobius.GetValuesAndSums(xfirst, xlast + 2, values, m, m0);
                sum += Pi2Medium(xfirst, xlast);
                UpdateMx(xfirst, xlast);
            }
#else
            for (var x = xmax; x > xmed; x -= mobiusBatchSize)
            {
                var xlast = x;
                var xfirst = Math.Max(xmed + 2, xlast - mobiusBatchSize + 2);
                m0 = mobius.GetValuesAndSums(xfirst, xlast + 2, values, m, m0);
                sum += Pi2Medium(xfirst, xlast);
                UpdateMx(xfirst, xlast);
            }
#endif

            // Process large x values.
            sum += Pi2Large();

            // Adjust for final parity of F2.
            sum -= IntegerMath.Mertens(kmax);

            // Compute final result.
            sum &= 3;
            Debug.Assert((sum & 1) == 0);
            sum >>= 1;
            return (sum + (n >= 2 ? 1 : 0)) % 2;
        }

        private int Pi2Small(long x1, long x2)
        {
            var s = F2SmallParallel(x1, x2);
            for (var k = 2; k <= kmax; k++)
            {
                var mu = IntegerMath.Mobius(k);
                if (mu != 0)
                    s += mu * F2Small((UInt128)IntegerMath.FloorRoot((BigInteger)n, k), x1, x2);
            }
            return s & 3;
        }

        private int Pi2Medium(long x1, long x2)
        {
            Debug.Assert(x1 > IntegerMath.FloorRoot(n, 4));
            return F2Medium(n, x1, x2);
        }

        private int Pi2Large()
        {
            // Finialize mx.
            ComputeMx();

            // Compute tail.
            var s = (long)0;
            for (var i = 1; i < imax; i++)
                s += T2Sequential(i) * (mx[i] - mx[i + 1]);
            return (int)(s & 3);
        }

        private int F2Small(UInt128 n, long x1, long x2)
        {
            var xmin = UpToOdd(Math.Max(1, x1));
            var xmax = DownToOdd(Math.Min((long)IntegerMath.FloorSquareRoot(n), x2));
            var s = 0;
            var x = xmax;
            var xx = (ulong)x * (ulong)x;
            var dx = 4 * (ulong)x - 4;
            while (x >= xmin)
            {
                Debug.Assert(xx == (ulong)x * (ulong)x);
                var mu = values[(x - x1) >> 1];
                if (mu > 0)
                    s += T2Isolated(n / xx);
                else if (mu < 0)
                    s -= T2Isolated(n / xx);
                xx -= dx;
                dx -= 8;
                x -= 2;
            }
            return s & 3;
        }

        private int F2SmallParallel(long x1, long x2)
        {
            var xmin = UpToOdd(Math.Max(1, x1));
            var xmax = DownToOdd(Math.Min((long)IntegerMath.FloorSquareRoot(n), x2));

            if (threads <= 1)
                return F2SmallParallel(0, xmin, xmax, x1, 2);

            var xsmall = DownToOdd(Math.Max(xmin, Math.Min(smallCutoff, xmax)));
            var s = 0;
            for (var x = xmin; x < xsmall; x += 2)
                s += IntegerMath.Mobius(x) * T2Parallel(n / ((UInt128)x * (UInt128)x));
            var tasks = new Task<int>[threads];
            var increment = 2 * threads;
            for (var thread = 0; thread < threads; thread++)
            {
                var worker = thread;
                var offset = 2 * thread;
                tasks[thread] = Task.Factory.StartNew(() => F2SmallParallel(worker, xsmall + offset, xmax, x1, increment));
            }
            Task.WaitAll(tasks);
            s += tasks.Select(task => task.Result).Sum();
            return s & 3;
        }

        private int F2SmallParallel(int thread, long xmin, long xmax, long offset, long increment)
        {
            var s = 0;
            var xx = (ulong)xmin * (ulong)xmin;
            var dx1 = 2 * (ulong)increment * (ulong)xmin + (ulong)increment * (ulong)increment;
            var dx2 = 2 * (ulong)increment * (ulong)increment;
            for (var x = xmin; x <= xmax; x += increment)
            {
                Debug.Assert(xx == (ulong)x * (ulong)x);
                var mu = values[(x - offset) >> 1];
                if (mu > 0)
                    s += T2Isolated(thread, n / xx);
                else if (mu < 0)
                    s -= T2Isolated(thread, n / xx);
                xx += dx1;
                dx1 += dx2;
            }
            return s & 3;
        }

        private int F2Medium(UInt128 n, long x1, long x2)
        {
            var xmin = UpToOdd(Math.Max(1, x1));
            var xmax = DownToOdd(Math.Min((long)IntegerMath.FloorSquareRoot(n), x2));
            var s = 0;
            var x = xmax;
            var beta = (long)(n / ((ulong)x + 2));
            var eps = (long)(n % ((ulong)x + 2));
            var delta = (long)(n / (ulong)x - (ulong)beta);
            var gamma = (long)(2 * (UInt128)beta - (UInt128)x * (UInt128)delta);
            var alpha = beta / (x + 2);
            var alphax = (alpha + 1) * (x + 2);
            var lastalpha = (long)-1;
            var count = 0;
            while (x >= xmin)
            {
                eps += gamma;
                if (eps >= x)
                {
                    ++delta;
                    gamma -= x;
                    eps -= x;
                    if (eps >= x)
                    {
                        ++delta;
                        gamma -= x;
                        eps -= x;
                        if (eps >= x)
                            break;
                    }
                }
                else if (eps < 0)
                {
                    --delta;
                    gamma += x;
                    eps += x;
                }
                beta += delta;
                gamma += delta << 2;

                alphax -= 2 * alpha + 2;
                if (alphax <= beta)
                {
                    ++alpha;
                    alphax += x;
                    if (alphax <= beta)
                    {
                        ++alpha;
                        alphax += x;
                        if (alphax <= beta)
                            break;
                    }
                }

                Debug.Assert(eps == (BigInteger)n % x);
                Debug.Assert(beta == (BigInteger)n / x);
                Debug.Assert(delta == beta - (BigInteger)n / (x + 2));
                Debug.Assert(gamma == 2 * beta - (BigInteger)(x - 2) * delta);
                Debug.Assert(alpha == n / ((BigInteger)x * x));

                var mu = values[(x - x1) >> 1];
                if (mu != 0)
                {
                    if (alpha != lastalpha)
                    {
                        count &= 3;
                        if (count != 0)
                        {
                            s += count * T2Sequential(lastalpha);
                            count = 0;
                        }
                        lastalpha = alpha;
                    }
                    count += mu;
                }
                x -= 2;
            }
            count &= 3;
            if (count != 0)
                s += count * T2Sequential(lastalpha);
            var xx = (ulong)x * (ulong)x;
            var dx = 4 * (ulong)x - 4;
            while (x >= xmin)
            {
                Debug.Assert(xx == (ulong)x * (ulong)x);
                var mu = values[(x - x1) >> 1];
                if (mu > 0)
                    s += T2Sequential((long)(n / xx));
                else if (mu < 0)
                    s -= T2Sequential((long)(n / xx));
                xx -= dx;
                dx -= 8;
                x -= 2;
            }
            return s & 3;
        }

        private int T2Parallel(UInt128 n)
        {
            var result = (int)(hyperbolicSumParallel.Evaluate(n) & 3);
            Debug.Assert(result % 4 == new DivisionFreeDivisorSummatoryFunction(0, false, true).Evaluate(n) % 4);
            return result;
        }

        private int T2Isolated(UInt128 n)
        {
            return T2Isolated(0, n);
        }

        private int T2Isolated(int thread, UInt128 n)
        {
            return (int)(hyperbolicSum[thread].Evaluate(n) & 3);
        }

        private int T2Sequential(long n)
        {
            if (n < d1 || n >= d2)
            {
                var sum0 = (ulong)0;
                if (n >= d2 && n < d2 + divisorBatchSize)
                {
                    sum0 = d2 == 1 ? 0 : dsums[(d2 - d1 - 2) >> 1];
                    d1 = d2;
                }
                else if (n < d1 && n >= d1 - divisorBatchSize)
                {
                    // Could avoid an isolated computation if we supported summing down.
                    d1 = Math.Max(1, d1 - divisorBatchSize);
                    sum0 = d1 == 1 ? 0 : (ulong)T2Isolated((UInt128)(d1 - 2));
                }
                else
                {
                    d1 = DownToOdd((long)n);
                    sum0 = d1 == 1 ? 0 : (ulong)T2Isolated((UInt128)(d1 - 2));
                }
                d2 = DownToOdd(Math.Min(d1 + divisorBatchSize, Math.Max(divisors.Size, d1)));
                divisors.GetSums(d1, d2, dsums, sum0);
            }
            Debug.Assert(dsums[(int)(n - d1) >> 1] % 4 == new DivisionFreeDivisorSummatoryFunction(0, false, true).Evaluate(n) % 4);
            return (int)(dsums[(int)(n - d1) >> 1] & 3);
        }

        private long Xi(long i)
        {
            return (long)IntegerMath.FloorSquareRoot(n / (ulong)i);
        }

        private void UpdateMx(long x1, long x2)
        {
            if (threads <= 1)
            {
                UpdateMx(x1, x2, 1, 1);
                return;
            }

            var tasks = new Task[threads];
            for (var thread = 0; thread < threads; thread++)
            {
                var offset = thread + 1;
                tasks[thread] = Task.Factory.StartNew(() => UpdateMx(x1, x2, offset, threads));
            }
            Task.WaitAll(tasks);
        }

        private void UpdateMx(long x1, long x2, long offset, long increment)
        {
            // Add the contributions to each mx from all the small m values.
            for (var i = offset; i <= imax; i += increment)
            {
                var x = xi[i];
                var sqrt = IntegerMath.FloorSquareRoot(x);
                var s = (long)0;

                var jmin = UpToOdd(Math.Max(3, x / (x2 + 2) + 1));
                var jmax = DownToOdd(Math.Min(sqrt, x / x1));
                s += JSum(x, jmin, ref jmax, x1);
                for (var j = jmin; j <= jmax; j += 2)
                    s += m[(x / j - x1) >> 1];

                var kmin = Math.Max(1, x1);
                var kmax = Math.Min(x / sqrt - 1, x2 + 1);
                s += KSum(x, kmin, ref kmax, x1);
                var current = T1Odd(x / kmin);
                for (var k = kmin; k <= kmax; k++)
                {
                    var next = T1Odd(x / (k + 1));
                    s += (current - next) * m[(k - x1) >> 1];
                    current = next;
                }

                mx[i] -= s;
            }
        }

        private long JSum(long n, long j1, ref long j, long x1)
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

                s += m[(beta - x1) >> 1];
                j -= 2;
            }
            return s;
        }

        private long KSum(long n, long k1, ref long k, long x1)
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
                s += ((delta + (beta & 1)) >> 1) * m[(k - x1) >> 1];
                --k;
            }
            return s;
        }

        private void ComputeMx()
        {
            // Add the remaining contributions to each mx from other mx values.
            for (var i = imax; i >= 1; i--)
            {
                var jmax = DownToOdd(xi[i] / (xmax + 2));
                var s = (long)0;
                for (var j = (long)3; j <= jmax; j += 2)
                    s += mx[j * j * i];
                mx[i] += 1 - s;
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
            return (a + 1) >> 1;
        }
    }
}
