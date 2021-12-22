using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;
using System.Diagnostics;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using System.Threading;
using System.Runtime.InteropServices;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class SquareFreeCounting
    {
        private const long maximumBatchSize = (long)1 << 25;
        private const long tmax = (long)1 << 62;
        private const long tmin = -tmax;
        private const long C1 = 1;
        private const long C2 = 1;
        private const long betaMax = (long)1 << 62;

        private int threads;
        private bool simple;
        private BigInteger n;
        private long imax;
        private long xmax;
        private BigInteger sum;
        private MobiusRangeAdditive mobius;
        private long[] xi;
        private long[] mx;
        private int m0;
        private sbyte[] values;
        private int[] m;

        public SquareFreeCounting(int threads, bool simple)
        {
            this.threads = threads;
            this.simple = simple;
        }

        public BigInteger Evaluate(BigInteger n)
        {
            this.n = n;
            if (n == 1)
                return 1;
            sum = 0;
            imax = (long)IntegerMath.FloorRoot(n, 5) * C1 / C2;
            xmax = imax != 0 ? Xi(imax) : (long)IntegerMath.FloorPower(n, 1, 2);
            mobius = new MobiusRangeAdditive(xmax + 1, threads);
            xi = new long[imax + 1];
            mx = new long[imax + 1];

            // Initialize xi.
            for (var i = 1; i <= imax; i++)
                xi[i] = Xi(i);

            values = new sbyte[maximumBatchSize];
            m = new int[maximumBatchSize];
            m0 = 0;
            for (var x = (long)1; x <= xmax; x += maximumBatchSize)
                m0 = EvaluateBatch(x, Math.Min(xmax, x + maximumBatchSize - 1));

            EvaluateTail();
            return sum;
        }

        private int EvaluateBatch(long x1, long x2)
        {
            mobius.GetValuesAndSums(x1, x2 + 1, values, m, m0);
            if (threads <= 1)
            {
                var x = x2;
                if (!simple)
                    x = S1(x1, x, values, x1);
                x = S3(x1, x, values, x1);
                UpdateMx(x1, x2, 1, 1);
            }
            else
            {
                var tasks = new Task[threads];
                var length = (x2 - x1 + 1 + threads - 1) / threads;
                for (var thread = 0; thread < threads; thread++)
                {
                    var xstart = x1 + thread * length;
                    var xend = Math.Min(x2, xstart + length - 1);
                    tasks[thread] = Task.Factory.StartNew(() =>
                        {
                            var x = xend;
                            if (!simple)
                                x = S1(xstart, x, values, x1);
                            x = S3(xstart, x, values, x1);
                        });
                }
                Task.WaitAll(tasks);

                for (var thread = 0; thread < threads; thread++)
                {
                    var offset = thread + 1;
                    tasks[thread] = Task.Factory.StartNew(() => UpdateMx(x1, x2, offset, threads));
                }
                Task.WaitAll(tasks);
            }
            return m[x2 - x1];
        }

        private void EvaluateTail()
        {
            // Finialize mx.
            ComputeMx();

            // Compute tail.
            var s = (BigInteger)0;
            for (var i = 1; i < imax; i++)
                s += mx[i];
            s -= (imax - 1) * mx[imax];

            AddToSum(s);
        }

        private long S1(long x1, long x2, sbyte[] values, long offset)
        {
            if (n / x2 > betaMax)
                return x2;

            var s = (Int128)0;
            var t = (long)0;
            var x = x2;
            var beta = (long)(n / (x + 1));
            var eps = (long)(n % (x + 1));
            var delta = (long)(n / x - beta);
            var gamma = (long)beta - x * delta;
            var alpha = beta / (x + 1);
            var alphax = (alpha + 1) * (x + 1);
            while (x >= x1)
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
                gamma += delta << 1;
                beta += delta;
                alphax -= alpha + 1;
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

                Debug.Assert(eps == n % x);
                Debug.Assert(beta == n / x);
                Debug.Assert(delta == beta - n / (x + 1));
                Debug.Assert(gamma == beta - (BigInteger)(x - 1) * delta);
                Debug.Assert(alpha == n / ((BigInteger)x * x));

                t += (int)alpha * values[x - offset];
                if (t > tmax || t < tmin)
                {
                    s += t;
                    t = 0;
                }
                --x;
            }
            s += t;
            AddToSum(s);
            return x;
        }

        private long S3(long x1, long x2, sbyte[] values, long offset)
        {
            var nRep = (UInt128)n;
            var s = nRep;
            var xx = (ulong)x1 * (ulong)x1;
            var dx = 2 * (ulong)x1 + 1;
            for (var x = x1; x <= x2; x++)
            {
                var mu = values[x - offset];
                if (mu == 1)
                    s += nRep / xx;
                else if (mu == -1)
                    s -= nRep / xx;
                xx += dx;
                dx += 2;
            }
            AddToSum(s - n);
            return x1 - 1;
        }

        private long Xi(long i)
        {
            return (long)IntegerMath.FloorSquareRoot(n / i);
        }

        private void UpdateMx(long x1, long x2, long offset, long increment)
        {
            // Add the contributions to each mx from all the small m values.
            for (var i = offset; i <= imax; i += increment)
            {
                var x = xi[i];
                var sqrt = IntegerMath.FloorSquareRoot(x);
                var s = (long)0;

                var jmin = UpToOdd(Math.Max(3, x / (x2 + 1) + 1));
                var jmax = DownToOdd(Math.Min(sqrt, x / x1));
                s += JSum(x, jmin, ref jmax, x1);
                for (var j = jmin; j <= jmax; j += 2)
                    s += m[x / j - x1];

                var kmin = Math.Max(1, x1);
                var kmax = Math.Min(x / sqrt - 1, x2);
                s += KSum(x, kmin, ref kmax, x1);
                var current = T1Odd(x / kmin);
                for (var k = kmin; k <= kmax; k++)
                {
                    var next = T1Odd(x / (k + 1));
                    s += (current - next) * m[k - x1];
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
                gamma += delta << 2;
                beta += delta;

                Debug.Assert(eps == n % j);
                Debug.Assert(beta == n / j);
                Debug.Assert(delta == beta - n / (j + 2));
                Debug.Assert(gamma == 2 * beta - (BigInteger)(j - 2) * delta);

                s += m[beta - x1];
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
                gamma += delta << 1;
                beta += delta;

                Debug.Assert(eps == n % k);
                Debug.Assert(beta == n / k);
                Debug.Assert(delta == beta - n / (k + 1));
                Debug.Assert(gamma == beta - (BigInteger)(k - 1) * delta);

                // Equivalent to:
                // s += (T1Odd(beta) - T1Odd(beta - delta)) * m[k - x];
                s += ((delta + (beta & 1)) >> 1) * m[k - x1];
                --k;
            }
            return s;
        }

        private void ComputeMx()
        {
            // Add the remaining contributions to each mx from other mx values.
            for (var i = imax; i >= 1; i--)
            {
                var jmax = DownToOdd(xi[i] / (xmax + 1));
                var s = (long)0;
                for (var j = (long)3; j <= jmax; j += 2)
                    s += mx[j * j * i];
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

        private void AddToSum(BigInteger s)
        {
            if (!s.IsZero)
            {
                lock (this)
                    sum += s;
            }
        }

        private static BigInteger[] data10 = new BigInteger[]
        {
            BigInteger.Parse("1"),
            BigInteger.Parse("7"),
            BigInteger.Parse("61"),
            BigInteger.Parse("608"),
            BigInteger.Parse("6083"),
            BigInteger.Parse("60794"),
            BigInteger.Parse("607926"),
            BigInteger.Parse("6079291"),
            BigInteger.Parse("60792694"),
            BigInteger.Parse("607927124"),
            BigInteger.Parse("6079270942"),
            BigInteger.Parse("60792710280"),
            BigInteger.Parse("607927102274"),
            BigInteger.Parse("6079271018294"),
            BigInteger.Parse("60792710185947"),
            BigInteger.Parse("607927101854103"),
            BigInteger.Parse("6079271018540405"),
            BigInteger.Parse("60792710185403794"),
            BigInteger.Parse("607927101854022750"),
            BigInteger.Parse("6079271018540280875"),
            BigInteger.Parse("60792710185402613302"),
            BigInteger.Parse("607927101854026645617"),
            BigInteger.Parse("6079271018540266153468"),
            BigInteger.Parse("60792710185402662868753"),
            BigInteger.Parse("607927101854026628773299"),
            BigInteger.Parse("6079271018540266286424910"),
            BigInteger.Parse("60792710185402662866945299"),
            BigInteger.Parse("607927101854026628664226541"),
            BigInteger.Parse("6079271018540266286631251028"),
            BigInteger.Parse("60792710185402662866327383816"),
            BigInteger.Parse("607927101854026628663278087296"),
            BigInteger.Parse("6079271018540266286632795633943"),
            BigInteger.Parse("60792710185402662866327694188957"),
            BigInteger.Parse("607927101854026628663276901540346"),
            BigInteger.Parse("6079271018540266286632767883637220"),
            BigInteger.Parse("60792710185402662866327677953999263"),
            BigInteger.Parse("607927101854026628663276779463775476"),
        };

        public static BigInteger PowerOfTen(int i)
        {
            return data10[i];
        }
    }
}
