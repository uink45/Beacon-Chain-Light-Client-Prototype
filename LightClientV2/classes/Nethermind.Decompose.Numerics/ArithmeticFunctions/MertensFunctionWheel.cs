using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;
using System.Threading.Tasks;
using System.Diagnostics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class MertensFunctionWheel
    {
        // The algorithm used by this class is based on the following identity:
        //
        //  $\sum_{n \leq x, \gcd ( n, m) = 1} M \left( \frac{x}{n} \right) =
        //   \sum_{d | m \nobracket} \mu ( d)  [ x \geq d]$
        //
        // where $m$ is the wheel size.

        private const long maximumSmallBatchSize = (long)1 << 19;
        private const long maximumBatchSize = (long)1 << 26;
        private const long largeLimit = long.MaxValue;
        private const long tmax = (long)1 << 62;
        private const long tmin = -tmax;
        private const int maxSubtractions = 32;
        private const long C1 = 1;
        private const long C2 = 4;
        private const long C3 = 4;
        private const long C4 = 3;
        private const long C5 = 1;
        private const long C6 = 1;
        private const long C7 = 3;

        private int threads;
        private IArithmeticRange<sbyte, int> mobius;
        private UInt128 n;
        private long u;
        private int imax;
        private sbyte[] mu;
        private int[] m;
        private Int128[] mx;
        private int[] r;
        private long[] niSmall;
        private UInt128[] niLarge;
        private int[][] bucketsSmall;
        private int[][] bucketsLarge;

#if false
        private const int wheelSize = 2;
        private const int wheelCount = (2 - 1);
#endif
#if false
        private const int wheelSize = 2 * 3;
        private const int wheelCount = (2 - 1) * (3 - 1);
#endif
#if false
        private const int wheelSize = 2 * 3 * 5;
        private const int wheelCount = (2 -1) * (3 - 1) * (5 - 1);
#endif
#if false
        private const int wheelSize = 2 * 3 * 5 * 7;
        private const int wheelCount = (2 -1) * (3 - 1) * (5 - 1) * (7 - 1);
#endif
#if false
        private const int wheelSize = 2 * 3 * 5 * 7 * 11;
        private const int wheelCount = (2 -1) * (3 - 1) * (5 - 1) * (7 - 1) * (11 - 1);
#endif
#if false
        private const int wheelSize = 2 * 3 * 5 * 7 * 11 * 13;
        private const int wheelCount = (2 -1) * (3 - 1) * (5 - 1) * (7 - 1) * (11 - 1) * (13 - 1);
#endif
#if true
        private const int wheelSize = 2 * 3 * 5 * 7 * 11 * 13 * 17;
        private const int wheelCount = (2 - 1) * (3 - 1) * (5 - 1) * (7 - 1) * (11 - 1) * (13 - 1) * (17 - 1);
#endif
#if false
        private const int wheelSize = 2 * 3 * 5 * 7 * 11 * 13 * 17 * 19;
        private const int wheelCount = (2 - 1) * (3 - 1) * (5 - 1) * (7 - 1) * (11 - 1) * (13 - 1) * (17 - 1) * (19 - 1);
#endif
#if false
        private const int wheelSize = 2 * 3 * 5 * 7 * 11 * 13 * 17 * 19 * 23;
        private const int wheelCount = (2 - 1) * (3 - 1) * (5 - 1) * (7 - 1) * (11 - 1) * (13 - 1) * (17 - 1) * (19 - 1) * (23 - 1);
#endif
        private const int wheelSize2 = wheelSize >> 1;

        private int[] wheelSubtotal;
        private bool[] wheelInclude;
        private byte[] wheelNext;
        private byte[] wheelPrev;
        private int[] wheelFactors;
        private int[] wheelMobius;

        public MertensFunctionWheel(int threads)
        {
            this.threads = threads;
            wheelSubtotal = new int[wheelSize];
            wheelInclude = new bool[wheelSize >> 1];
            wheelNext = new byte[wheelSize >> 1];
            wheelPrev = new byte[wheelSize >> 1];
            var total = 0;
            for (var i = 0; i < wheelSize; i++)
            {
                var include = IntegerMath.GreatestCommonDivisor(i, wheelSize) == 1;
                if (include)
                    ++total;
                wheelSubtotal[i] = total;
                wheelInclude[i >> 1] = include;
            }
            Debug.Assert(total == wheelCount);
            var next = 0;
            for (var i = (wheelSize >> 1) - 1; i >= 0; i--)
            {
                next += 2;
                wheelNext[i] = (byte)next;
                if (wheelInclude[i])
                    next = 0;
            }
            var prev = 0;
            for (var i = 0; i < (wheelSize >> 1); i++)
            {
                prev += 2;
                wheelPrev[i] = (byte)prev;
                if (wheelInclude[i])
                    prev = 0;
            }
#if DEBUG
            for (var i = 1; i < wheelSize; i += 2)
            {
                var skip = wheelNext[i >> 1];
                for (var j = 2; j < skip; j += 2)
                {
                    if (wheelInclude[((i + j) % wheelSize) >> 1])
                        Debugger.Break();
                }
                if (!wheelInclude[((i + skip) % wheelSize) >> 1])
                    Debugger.Break();
            }
            for (var i = 1; i < wheelSize; i += 2)
            {
                var skip = wheelPrev[i >> 1];
                for (var j = 2; j < skip; j += 2)
                {
                    if (wheelInclude[((i - j + wheelSize) % wheelSize) >> 1])
                        Debugger.Break();
                }
                if (!wheelInclude[((i - skip + wheelSize) % wheelSize) >> 1])
                    Debugger.Break();
            }
#endif

            wheelFactors = IntegerMath.Factors(wheelSize).ToArray();
            wheelMobius = wheelFactors.Select(factor => IntegerMath.Mobius(factor)).ToArray();
        }

        public BigInteger Evaluate(BigInteger n)
        {
            if (n <= 0)
                return 0;

            return Evaluate((UInt128)n);
        }

        public Int128 Evaluate(UInt128 n)
        {
            if (n == 0)
                return 0;

            this.n = n;
            u = (long)IntegerMath.Max(IntegerMath.FloorPower(n, 2, 3) * C1 / C2, IntegerMath.CeilingSquareRoot(n));

            imax = (int)(n / (ulong)u);
            mobius = new MobiusRangeAdditive(u + 1, threads);
            var batchSize = Math.Min(u, maximumBatchSize);
            mu = new sbyte[maximumSmallBatchSize];
            m = new int[batchSize];
            mx = new Int128[imax + 1];
            r = new int[imax + 1];
            var lmax = 0;
            for (var i = 1; i <= imax; i += 2)
            {
                if (wheelInclude[(i % wheelSize) >> 1])
                    r[lmax++] = i;
            }
            Array.Resize(ref r, lmax);

            niLarge = new UInt128[imax + 1];
            niSmall = new long[imax + 1];
            var buckets = Math.Max(1, threads);
            var costs = new double[buckets];
            var bucketListsLarge = Enumerable.Range(0, buckets).Select(i => new List<int>()).ToArray();
            var bucketListsSmall = Enumerable.Range(0, buckets).Select(i => new List<int>()).ToArray();
            for (var l = 0; l < lmax; l++)
            {
                var i = r[l];
                var ni = n / (uint)i;
                var large = ni > largeLimit;
                var cost = Math.Sqrt((double)n / i) * (large ? C7 : 1);
                var addto = 0;
                var mincost = costs[0];
                for (var bucket = 0; bucket < buckets; bucket++)
                {
                    if (costs[bucket] < mincost)
                    {
                        mincost = costs[bucket];
                        addto = bucket;
                    }
                }
                niLarge[i] = ni;
                if (large)
                    bucketListsLarge[addto].Add(i);
                else
                {
                    niSmall[i] = (long)ni;
                    bucketListsSmall[addto].Add(i);
                }
                costs[addto] += cost;
            }
            bucketsLarge = bucketListsLarge.Select(bucket => bucket.ToArray()).ToArray();
            bucketsSmall = bucketListsSmall.Select(bucket => bucket.ToArray()).ToArray();

            var m0 = 0;
            var xmed = Math.Min((long)IntegerMath.FloorRoot(n, 2) * C5 / C6, u);
            for (var x = (long)1; x <= xmed; x += maximumSmallBatchSize)
            {
                var xstart = x;
                var xend = Math.Min(xstart + maximumSmallBatchSize - 1, xmed);
                m0 = mobius.GetValuesAndSums(xstart, xend + 1, mu, m, m0);
                ProcessBatch(xstart, xend);
            }
            for (var x = xmed + 1; x <= u; x += maximumBatchSize)
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
                UpdateMx(x1, x2, 0);
            else
            {
                var tasks = new Task[threads];
                for (var thread = 0; thread < threads; thread++)
                {
                    var bucket = thread;
                    tasks[thread] = Task.Factory.StartNew(() => UpdateMx(x1, x2, bucket));
                }
                Task.WaitAll(tasks);
            }
        }

        private void UpdateMx(long x1, long x2, int bucket)
        {
            UpdateMxLarge(x1, x2, bucketsLarge[bucket]);
            UpdateMxSmall(x1, x2, bucketsSmall[bucket]);
        }

        private void UpdateMxLarge(long x1, long x2, int[] r)
        {
            for (var l = 0; l < r.Length; l++)
            {
                var i = r[l];
                var x = niLarge[i];
                var sqrt = (long)UInt128.FloorSqrt(x);
                var xover = (long)UInt128.Min((ulong)(sqrt * C3 / C4), x);
                xover = (long)(x / (x / (ulong)xover));
                var s = (Int128)0;

                var jmin = UpToOdd(Math.Max(imax / i + 1, (long)UInt128.Min((ulong)xover + 1, x / ((ulong)x2 + 1) + 1)));
                var jmax = DownToOdd((long)UInt128.Min((ulong)xover, x / (ulong)x1));
                s += JSumLarge1(x, jmin, ref jmax, x1);
                s += JSumLarge2(x, jmin, jmax, x1);

                var kmin = Math.Max(1, x1);
                var kmax = (long)UInt128.Min(x / (ulong)xover - 1, (ulong)x2);
                s += KSumLarge1Mu(x, kmin, ref kmax, x1);
                //s += KSumLarge1M(x, kmin, ref kmax, x1);
                s += KSumLarge2(x, kmin, kmax, x1);

                mx[i] -= s;
            }
        }

        private void UpdateMxSmall(long x1, long x2, int[] r)
        {
            for (var l = 0; l < r.Length; l++)
            {
                var i = r[l];
                var x = niSmall[i];
                var sqrt = IntegerMath.FloorSquareRoot(x);
                var xover = Math.Min(sqrt * C3 / C4, x);
                xover = x / (x / xover);
                var s = (long)0;

                var jmin = UpToOdd(Math.Max(imax / i + 1, x / (x2 + 1) + 1));
                var jmax = DownToOdd(Math.Min(xover, x / x1));
                //s += JSumSmall1(x, jmin, ref jmax, x1);
                s += JSumSmall2(x, jmin, jmax, x1);

                var kmin = Math.Max(1, x1);
                var kmax = Math.Min(x / xover - 1, x2);
                s += KSumSmall1Mu(x, kmin, ref kmax, x1);
                //s += KSumSmall1M(x, kmin, ref kmax, x1);
                s += KSumSmall2(x, kmin, kmax, x1);

                mx[i] -= s;
            }
        }

        private Int128 JSumLarge1(UInt128 x, long j1, ref long j, long offset)
        {
            var s = (Int128)0;
            var t = (long)0;
            var beta = (long)(x / ((ulong)j + 2));
            var eps = (long)(x % ((ulong)j + 2));
            var delta = (long)(x / (ulong)j) - beta;
            var gamma = 2 * beta - j * delta;
            var mod = (j % wheelSize) >> 1;
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

                Debug.Assert(eps == (BigInteger)x % j);
                Debug.Assert(beta == (BigInteger)x / j);
                Debug.Assert(delta == beta - (BigInteger)x / (j + 2));
                Debug.Assert(gamma == 2 * beta - (BigInteger)(j - 2) * delta);

                if (wheelInclude[mod])
                {
                    t += m[beta - offset];
                    if (t > tmax || t < tmin)
                    {
                        s += t;
                        t = 0;
                    }
                }
                if (--mod < 0)
                    mod += wheelSize2;
                j -= 2;
            }
            s += t;
            return s;
        }

        private long JSumSmall1(long x, long j1, ref long j, long offset)
        {
            var s = (long)0;
            var beta = x / (j + 2);
            var eps = x % (j + 2);
            var delta = x / j - beta;
            var gamma = 2 * beta - j * delta;
            var mod = (j % wheelSize) >> 1;
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

                if (wheelInclude[mod])
                    s += m[beta - offset];
                if (--mod < 0)
                    mod += wheelSize2;
                j -= 2;
            }
            return s;
        }

        private long JSumLarge2(UInt128 x, long jmin, long jmax, long x1)
        {
            var s = (long)0;
            var j = UpToWheel(jmin);
            var mod = j % wheelSize;
            while (j <= jmax)
            {
                s += m[(int)(x / (ulong)j - (ulong)x1)];
                var skip = wheelNext[mod >> 1];
                j += skip;
                mod += skip;
                if (mod >= wheelSize)
                    mod -= wheelSize;
            }
            return s;
        }

        private long JSumSmall2(long x, long jmin, long jmax, long x1)
        {
#if false
            var s = (long)0;
            var j = UpToWheel(jmin);
            var mod = j % wheelSize;
            while (j <= jmax)
            {
                s += m[x / j - x1];
                var skip = wheelNext[mod >> 1];
                j += skip;
                mod += skip;
                if (mod >= wheelSize)
                    mod -= wheelSize;
            }
            return s;
#else
            var s = (long)0;
            var j = DownToWheel(jmax);
            var mod = j % wheelSize;
            var xj = x / j;
            var eps = x - xj * j;
            while (j >= jmin)
            {
                var count = 0;
                var j2 = j << 1;
                var j4 = j2 << 1;
                while (eps >= j4)
                {
                    xj += 4;
                    eps -= j4;
                    if (++count == (maxSubtractions >> 2))
                        goto simple;
                }
                count <<= 1;
                while (eps >= j2)
                {
                    xj += 2;
                    eps -= j2;
                    if (++count == (maxSubtractions >> 1))
                        goto simple;
                }
                count <<= 1;
                while (eps >= j)
                {
                    ++xj;
                    eps -= j;
                    if (++count == maxSubtractions)
                        goto simple;
                }
                s += m[xj - x1];
                var skip = wheelPrev[mod >> 1];
                j -= skip;
                mod -= skip;
                if (mod < 0)
                    mod += wheelSize;
                eps += skip * xj;
            }
        simple:
            while (j >= jmin)
            {
                s += m[x / j - x1];
                var skip = wheelPrev[mod >> 1];
                j -= skip;
                mod -= skip;
                if (mod < 0)
                    mod += wheelSize;
            }
            return s;
#endif
        }

        private long KSumSmall1Mu(long x, long k1, ref long k2, long offset)
        {
            var k = k2;
            if (k == 0 || k < k1)
                return 0;
            var s = (long)0;
            var beta = x / (k + 1);
            var eps = x % (k + 1);
            var delta = x / k - beta;
            var gamma = beta - k * delta;
            var firstBeta = beta;
            var betaOffset = beta / wheelSize * wheelCount;
            beta %= wheelSize;
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
                gamma += delta << 1;
                beta += delta;
                if (beta >= wheelSize)
                {
                    betaOffset += wheelCount;
                    beta -= wheelSize;
                    if (beta >= wheelSize)
                    {
                        var factor = beta / wheelSize;
                        betaOffset += factor * wheelCount;
                        beta -= factor * wheelSize;
                    }
                }
                var wheel = betaOffset + wheelSubtotal[beta];

                Debug.Assert(eps == x % k);
                Debug.Assert(beta == x / k % wheelSize);
                Debug.Assert(delta == x / k - x / (k + 1));
                Debug.Assert(gamma == x / k - (BigInteger)(k - 1) * delta);
                Debug.Assert(betaOffset == x / k / wheelSize * wheelCount);
                Debug.Assert(wheel == T1Wheel(x / k));

#if true
                s += wheel * mu[k - offset];
#endif
#if false
                var value = (int)mu[k - offset];
                var flip = value >> 31;
                s += ((wheel ^ flip) - flip) & (value << 31 >> 31);
#endif
#if false
                s += T1Wheel(beta) * mu[k - offset];
#endif
#if false
                var value = (int)mu[k - offset];
                var flip = value >> 31;
                s += ((T1Wheel(beta) ^ flip) - flip) & (value << 31 >> 31);
#endif
#if false
                var value = mu[k - offset];
                if (value != 0)
                {
                    var flip = value >> 31;
                    s += (T1Wheel(beta) ^ flip) - flip;
                }
#endif
                --k;
            }
            s -= T1Wheel(firstBeta) * m[k2 - offset];
            s += (betaOffset + wheelSubtotal[beta]) * (m[k + 1 - offset] - mu[k + 1 - offset]);
            k2 = k;
            return s;
        }

        private long KSumSmall1M(long x, long k1, ref long k, long offset)
        {
            if (k == 0)
                return 0;
            var s = (long)0;
            var beta = x / (k + 1);
            var eps = x % (k + 1);
            var delta = x / k - beta;
            var gamma = beta - k * delta;
            var lastCount = T1Wheel(beta);
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
                gamma += delta << 1;
                beta += delta;

                Debug.Assert(eps == x % k);
                Debug.Assert(beta == x / k);
                Debug.Assert(delta == beta - x / (k + 1));
                Debug.Assert(gamma == beta - (BigInteger)(k - 1) * delta);

                var count = T1Wheel(beta);
                s += (count - lastCount) * m[k - offset];
                lastCount = count;
                --k;
            }
            return s;
        }

        private Int128 KSumLarge1Mu(UInt128 x, long k1, ref long k2, long offset)
        {
            var k = k2;
            if (k == 0 || k < k1)
                return 0;
            var s = (Int128)0;
            var t = (long)0;
            var beta = (long)(x / (ulong)(k + 1));
            var eps = (long)(x % (ulong)(k + 1));
            var delta = (long)(x / (ulong)k - (ulong)beta);
            var gamma = (long)(beta - k * delta);
            var firstBeta = beta;
            var betaOffset = beta / wheelSize * wheelCount;
            beta %= wheelSize;
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
                gamma += delta << 1;
                beta += delta;
                if (beta >= wheelSize)
                {
                    betaOffset += wheelCount;
                    beta -= wheelSize;
                    if (beta >= wheelSize)
                    {
                        var factor = beta / wheelSize;
                        betaOffset += factor * wheelCount;
                        beta -= factor * wheelSize;
                    }
                }
                var wheel = betaOffset + wheelSubtotal[beta];

                Debug.Assert(eps == (BigInteger)x % k);
                Debug.Assert(beta == (BigInteger)x / k % wheelSize);
                Debug.Assert(delta == (BigInteger)x / k - (BigInteger)x / (k + 1));
                Debug.Assert(gamma == (BigInteger)x / k - (BigInteger)(k - 1) * delta);
                Debug.Assert(betaOffset == (BigInteger)x / k / wheelSize * wheelCount);
                Debug.Assert(wheel == T1Wheel((BigInteger)x / k));

                t += wheel * mu[k - offset];
                if (t > tmax || t < tmin)
                {
                    s += t;
                    t = 0;
                }
                --k;
            }
            s += t;
            s -= T1Wheel(firstBeta) * m[k2 - offset];
            s += (betaOffset + wheelSubtotal[beta]) * (m[k + 1 - offset] - mu[k + 1 - offset]);
            k2 = k;
            return s;
        }

        private Int128 KSumLarge1M(UInt128 x, long k1, ref long k, long offset)
        {
            if (k == 0)
                return 0;
            var s = (Int128)0;
            var t = (long)0;
            var beta = (long)(x / (ulong)(k + 1));
            var eps = (long)(x % (ulong)(k + 1));
            var delta = (long)(x / (ulong)k - (ulong)beta);
            var gamma = (long)(beta - k * delta);
            var lastCount = T1Wheel(beta);
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
                gamma += delta << 1;
                beta += delta;

                Debug.Assert(eps == (BigInteger)x % k);
                Debug.Assert(beta == (BigInteger)x / k);
                Debug.Assert(delta == beta - (BigInteger)x / (k + 1));
                Debug.Assert(gamma == beta - (BigInteger)(k - 1) * delta);

                var count = T1Wheel(beta);
                t += (count - lastCount) * m[k - offset];
                if (t > tmax || t < tmin)
                {
                    s += t;
                    t = 0;
                }
                lastCount = count;
                --k;
            }
            s += t;
            return s;
        }

        private long KSumSmall2(long x, long kmin, long kmax, long x1)
        {
            var s = (long)0;
            var current = T1Wheel(x / kmin);
            for (var k = kmin; k <= kmax; k++)
            {
                var next = T1Wheel(x / (k + 1));
                s += (current - next) * m[k - x1];
                current = next;
            }
            return s;
        }

        private Int128 KSumLarge2(UInt128 x, long kmin, long kmax, long x1)
        {
            var s = (Int128)0;
            var current = T1Wheel(x / (ulong)kmin);
            for (var k = kmin; k <= kmax; k++)
            {
                var next = T1Wheel(x / (ulong)(k + 1));
                Int128.AddProduct(ref s, current - next, m[k - x1]);
                current = next;
            }
            return s;
        }

        private void ComputeMx()
        {
            for (var l = r.Length - 1; l >= 0; l--)
            {
                var i = r[l];
                var ni = niLarge[i];
                var s = (Int128)0;

                // Include values of smaller isolated values of n/i.
                for (var ij = 2 * i; ij <= imax; ij += i)
                    s += mx[ij];

                // Values not less than the wheel size all cancel to zero.
                if (ni < wheelSize)
                {
                    // Correction for values of n/i less than the wheel size.
                    for (var k = 0; k < wheelFactors.Length; k++)
                        s -= wheelMobius[k] * (ni >= wheelFactors[k] ? 1 : 0);
                }

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

        private long UpToWheel(long a)
        {
            var b = (a % wheelSize) >> 1;
            return wheelInclude[b] ? a : a + wheelNext[b];
        }

        private long DownToWheel(long a)
        {
            var b = (a % wheelSize) >> 1;
            return wheelInclude[b] ? a : a - wheelPrev[b];
        }

        private long T1Wheel(long a)
        {
            var b = a / wheelSize;
            var c = (int)(a - b * wheelSize);
            return wheelCount * b + wheelSubtotal[c];
        }

        private UInt128 T1Wheel(UInt128 a)
        {
            var b = a / wheelSize;
            var c = (int)(a - b * wheelSize);
            return (uint)wheelCount * b + (uint)wheelSubtotal[c];
        }

        private BigInteger T1Wheel(BigInteger a)
        {
            var b = a / wheelSize;
            var c = (int)(a - b * wheelSize);
            return (uint)wheelCount * b + (uint)wheelSubtotal[c];
        }
    }
}
