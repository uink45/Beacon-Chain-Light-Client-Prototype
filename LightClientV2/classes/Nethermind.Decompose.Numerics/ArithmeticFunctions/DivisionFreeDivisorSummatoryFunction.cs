using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class DivisionFreeDivisorSummatoryFunction : IDivisorSummatoryFunction<BigInteger>
    {
        private struct WorkItem
        {
            public long Min;
            public long Max;
        }

        private const ulong tmax = (ulong)1 << 62;
        private const long maximumBatchSize = (long)1 << 28;
        private const long nmax = (long)1 << 58;
        private const long nmaxOdd = (long)1 << 60;

        private int threads;
        private bool simple;
        private bool odd;
        private bool mod2;
        private BigInteger n;
        private UInt128 sum;
        private int modsum;

        public DivisionFreeDivisorSummatoryFunction(int threads)
            : this(threads, false, false, false)
        {
        }

        public DivisionFreeDivisorSummatoryFunction(int threads, bool simple)
            : this(threads, simple, false, false)
        {
        }

        public DivisionFreeDivisorSummatoryFunction(int threads, bool simple, bool odd)
            : this(threads, simple, odd, false)
        {
        }

        public DivisionFreeDivisorSummatoryFunction(int threads, bool simple, bool odd, bool mod2)
        {
            this.threads = threads;
            this.simple = simple;
            this.odd = odd;
            this.mod2 = mod2;
        }

        public BigInteger Evaluate(BigInteger n)
        {
            this.n = n;
            sum = 0;
            modsum = 0;
            var xmax = (long)IntegerMath.FloorSquareRoot(n);
            if (threads <= 1)
                Evaluate(1, xmax);
            else
                EvaluateParallel(1, xmax);
            if (odd)
            {
                var xmax2 = (xmax + 1) / 2;
                if (mod2)
                    return (2 * (int)(modsum & 1) - (int)(xmax2 & 1)) & 3;
                return 2 * (BigInteger)sum - (BigInteger)xmax2 * xmax2;
            }
            return 2 * (BigInteger)sum - (BigInteger)xmax * xmax;
        }

        public BigInteger Evaluate(BigInteger n, BigInteger x1, BigInteger x2)
        {
            this.n = n;
            sum = 0;
            modsum = 0;
            if (threads <= 1 || x2 - x1 < ((long)1 << 10))
                Evaluate((long)x1, (long)x2);
            else
                EvaluateParallel((long)x1, (long)x2);
            return mod2 ? (BigInteger)(modsum & 3) : sum;
        }

        private void Evaluate(long x1, long x2)
        {
            var x = x2;
            if (odd)
            {
                if (mod2)
                {
                    if (!simple)
                        x = S1OddMod2(x1, x);
                    x = S3OddMod2(x1, x);
                }
                else
                {
                    if (!simple)
                        x = S1Odd(x1, x);
                    x = S3Odd(x1, x);
                }
            }
            else
            {
                if (!simple)
                    x = S1(x1, x);
                x = S3(x1, x);
            }
        }

        private void EvaluateParallel(long xmin, long xmax)
        {
            // Create consumers.
            var queue = new BlockingCollection<WorkItem>();
            var consumers = threads;
            var tasks = new Task[consumers];
            for (var consumer = 0; consumer < consumers; consumer++)
            {
                var thread = consumer;
                tasks[consumer] = Task.Factory.StartNew(() => ConsumeItems(thread, queue));
            }

            // Produce work items.
            ProduceItems(queue, xmin, xmax);

            // Wait for completion.
            queue.CompleteAdding();
            Task.WaitAll(tasks);
        }

        private void ProduceItems(BlockingCollection<WorkItem> queue, long imin, long imax)
        {
            var batchSize = Math.Min(maximumBatchSize, (imax - imin + 1 + threads - 1) / threads);
            for (var i = imin; i <= imax; i += batchSize)
                queue.Add(new WorkItem { Min = i, Max = Math.Min(i + batchSize - 1, imax) });
        }

        private void ConsumeItems(int thread, BlockingCollection<WorkItem> queue)
        {
            var item = default(WorkItem);
            while (queue.TryTake(out item, Timeout.Infinite))
                Evaluate(item.Min, item.Max);
        }

        private long S1(long x1, long x2)
        {
            if (n < nmax)
                return S1Small(x1, x2);
            var s = (UInt128)0;
            var t = (ulong)0;
            var x = x2;
            var beta = (ulong)(n / (x + 1));
            var eps = (long)(n % (x + 1));
            var delta = (long)(n / x - beta);
            var gamma = (long)beta - x * delta;
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
                beta += (ulong)delta;
                gamma += delta << 1;

                Debug.Assert(eps == n % x);
                Debug.Assert(beta == n / x);
                Debug.Assert(delta == beta - n / (x + 1));
                Debug.Assert(gamma == beta - (BigInteger)(x - 1) * delta);

                t += beta;
                if (t > tmax)
                {
                    s += t;
                    t = 0;
                }
                --x;
            }
            s += t;
            AddToSum(ref s);
            return x;
        }

        private long S1Small(long x1, long x2)
        {
            var t = (ulong)0;
            var x = x2;
            var beta = (ulong)(n / (x + 1));
            var eps = (long)(n % (x + 1));
            var delta = (long)(n / x - beta);
            var gamma = (long)beta - x * delta;
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
                beta += (ulong)delta;
                gamma += delta << 1;

                Debug.Assert(eps == n % x);
                Debug.Assert(beta == n / x);
                Debug.Assert(delta == beta - n / (x + 1));
                Debug.Assert(gamma == beta - (BigInteger)(x - 1) * delta);

                t += beta;
                --x;
            }
            var s = (UInt128)t;
            AddToSum(ref s);
            return x;
        }

        private long S3(long x1, long x2)
        {
            if (n < ulong.MaxValue)
                return S3UInt64(x1, x2);

            var s = (UInt128)0;
            var nRep = (UInt128)n;
            var x = x2;
            while (x >= x1)
            {
                s += nRep / (ulong)x;
                --x;
            }
            AddToSum(ref s);
            return x;
        }

        private long S3UInt64(long x1, long x2)
        {
            var s = (UInt128)0;
            var t = (ulong)0;
            var nRep = (ulong)n;
            var x = x2;
            while (x >= x1)
            {
                t += nRep / (ulong)x;
                if (t > tmax)
                {
                    s += t;
                    t = 0;
                }
                --x;
            }
            s += t;
            AddToSum(ref s);
            return x;
        }

        private long S1Odd(long x1, long x2)
        {
            if (n < nmaxOdd)
                return S1OddSmall((int)x1, (int)x2);
            var s = (UInt128)0;
            var t = (ulong)0;
            var x = (x2 - 1) | 1;
            var beta = (ulong)(n / (x + 2));
            var eps = (long)(n % (x + 2));
            var delta = (long)(n / x - beta);
            var gamma = 2 * (long)beta - x * delta;
            ++beta;
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
                beta += (ulong)delta;
                gamma += delta << 2;

                Debug.Assert(eps == n % x);
                Debug.Assert(beta == n / x + 1);
                Debug.Assert(delta == n / x - n / (x + 2));
                Debug.Assert(gamma == 2 * (n / x) - (BigInteger)(x - 2) * delta);

                t += beta >> 1;
                if (t > tmax)
                {
                    s += t;
                    t = 0;
                }
                x -= 2;
            }
            s += t;
            AddToSum(ref s);
            return x;
        }

        private long S1OddSmall(int x1, int x2)
        {
            if (x2 < 1)
                return x1 - 2;
            var t = (ulong)0;
            var x = (x2 - 1) | 1;
            var beta = (ulong)(n / (x + 2));
            var eps = (int)(n % (x + 2));
            var delta = (int)(n / x - beta);
            var gamma = 2 * (int)beta - x * delta;
            ++beta;
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
                beta += (uint)delta;
                gamma += delta << 2;

                Debug.Assert(eps == n % x);
                Debug.Assert(beta == n / x + 1);
                Debug.Assert(delta == n / x - n / (x + 2));
                Debug.Assert(gamma == 2 * (n / x) - (BigInteger)(x - 2) * delta);

                t += beta >> 1;
                x -= 2;
            }
            var s = (UInt128)t;
            AddToSum(ref s);
            return x;
        }

        private long S3Odd(long x1, long x2)
        {
            if (n <= uint.MaxValue)
                return S3OddUInt32((int)x1, (int)x2);
            if (n <= ulong.MaxValue)
                return S3OddUInt64(x1, x2);

            var s = (UInt128)0;
            var tOdd = (ulong)0;
            var nRep = (UInt128)n;
            var x = (x2 - 1) | 1;
            while (x >= x1)
            {
                var beta = nRep / (ulong)x;
                s += beta;
                if (!beta.IsEven)
                    ++tOdd;
                x -= 2;
            }
            s += tOdd;
            s >>= 1;
            AddToSum(ref s);
            return x;
        }

        private long S3OddUInt64(long x1, long x2)
        {
            var s = (UInt128)0;
            var t = (ulong)0;
            var nRep = (ulong)n;
            var x = (x2 - 1) | 1;
            while (x >= x1)
            {
                var beta = nRep / (ulong)x;
                t += beta + (beta & 1);
                if (t > tmax)
                {
                    s += t;
                    t = 0;
                }
                x -= 2;
            }
            s += t;
            s >>= 1;
            AddToSum(ref s);
            return x;
        }

        private long S3OddUInt32(int x1, int x2)
        {
            var t = (ulong)0;
            var nRep = (uint)n;
            var x = (x2 - 1) | 1;
            while (x >= x1)
            {
                var beta = nRep / (uint)x;
                t += beta + (beta & 1);
                x -= 2;
            }
            t >>= 1;
            var s = (UInt128)t;
            AddToSum(ref s);
            return x;
        }

        private long S1OddMod2(long x1, long x2)
        {
            if (n <= long.MaxValue)
                return S1OddMod2((int)x1, (int)x2);
            var s = (long)0;
            var x = (x2 - 1) | 1;
            var beta = (long)(n / (x + 2));
            var eps = (long)(n % (x + 2));
            var delta = (long)(n / x - beta);
            var gamma = 2 * beta - x * delta;
            ++beta;
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
                beta += delta;
                gamma += delta << 2;

                Debug.Assert(eps == n % x);
                Debug.Assert(beta == (n / x + 1) % 4);
                Debug.Assert(delta == (n / x) - n / (x + 2));
                Debug.Assert(gamma == 2 * (n / x) - (BigInteger)(x - 2) * delta);

                s ^= beta;
                x -= 2;
            }
            AddToModSum((int)(s >> 1));
            return x;
        }

        private long S3OddMod2(long x1, long x2)
        {
            if (n <= long.MaxValue)
                return S3OddMod2((int)x1, (int)x2);
            var x = (x2 - 1) | 1;
            var s = 0;
            var nRep = (UInt128)n;
            while (x >= x1)
            {
                s ^= (int)((nRep / (ulong)x) & 3) + 1;
                x -= 2;
            }
            AddToModSum(s >> 1);
            return x;
        }

        private int S1OddMod2(int x1, int x2)
        {
            var s = (int)0;
            var x = (int)(x2 - 1) | 1;
            var bigbeta = (n / (x + 2));
            var eps = (int)(n % (x + 2));
            var delta = (int)(n / x - bigbeta);
            var gamma = (int)(2 * bigbeta - (long)x * delta);
            var beta = (int)((bigbeta + 1) & 3);
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
                beta += delta;
                gamma += delta << 2;

                Debug.Assert(eps == n % x);
                Debug.Assert((beta & 3) == (n / x + 1) % 4);
                Debug.Assert(delta == n / x - n / (x + 2));
                Debug.Assert(gamma == 2 * (n / x) - (BigInteger)(x - 2) * delta);

                s ^= beta;
                x -= 2;
            }
            AddToModSum(s >> 1);
            return x;
        }

        private int S3OddMod2(int x1, int x2)
        {
            var xmin = (uint)x1;
            var x = (x2 - 1) | 1;
            var s = (uint)0;
            var nRep = (long)n;
#if true
            var beta2 = nRep / (x + 4);
            var beta1 = nRep / (x + 2);
            var eps = nRep % (x + 2);
            var delta1 = beta1 - beta2;
            var delta2 = delta1 - (beta2 - nRep / (x + 6));
            var gamma = 2 * beta1 - x * delta1;
            var alpha = x * delta2;
            var beta = (uint)((beta1 + 1) & 3);
            while (x >= x1)
            {
                eps += gamma - alpha;
                if (eps >= x)
                {
                    ++delta2;
                    alpha += x;
                    eps -= x;
                    if (eps >= x)
                    {
                        ++delta2;
                        alpha += x;
                        eps -= x;
                        if (eps >= x)
                        {
                            ++delta2;
                            alpha += x;
                            eps -= x;
                            if (eps >= x)
                                break;
                        }
                    }
                }
                else if (eps < 0)
                {
                    --delta2;
                    alpha -= x;
                    eps += x;
                    if (eps < 0)
                    {
                        --delta2;
                        alpha -= x;
                        eps += x;
                        if (eps < 0)
                        {
                            --delta2;
                            alpha -= x;
                            eps += x;
                        }
                    }
                }
                delta1 += delta2;
                beta += (uint)delta1;
                gamma += (delta1 << 2) - alpha;
                alpha -= (delta2 << 1);

                Debug.Assert(eps == n % x);
                Debug.Assert((beta & 3) == (n / x + 1) % 4);
                Debug.Assert(delta1 == n / x - n / (x + 2));
                Debug.Assert(delta2 == delta1 - (n / (x + 2) - n / (x + 4)));
                Debug.Assert(gamma == 2 * (n / x) - (x - 2) * delta1);
                Debug.Assert(alpha == (x - 2) * delta2);

                s ^= beta;
                x -= 2;
            }
#endif
            while (x >= x1)
            {
                s ^= (uint)(nRep / (uint)x) + 1;
                x -= 2;
            }
            AddToModSum((int)(s >> 1));
            return x;
        }

        private void AddToSum(ref UInt128 s)
        {
            if (!s.IsZero)
            {
                lock (this)
                    sum += s;
            }
        }

        private void AddToModSum(int s)
        {
            Interlocked.Add(ref modsum, s);
        }
    }
}
