using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class PrimeCounting
    {
        private const int sizeSmall = 1024;
        private const int chunkSize = 32;
        private int threads;
        private int[] piSmall;
        private int[] tauSumSmall;
        private int[] mobiusSmall;

        private static BigInteger[] data2 =
        {
            BigInteger.Parse("0"),
            BigInteger.Parse("1"),
            BigInteger.Parse("2"),
            BigInteger.Parse("4"),
            BigInteger.Parse("6"),
            BigInteger.Parse("11"),
            BigInteger.Parse("18"),
            BigInteger.Parse("31"),
            BigInteger.Parse("54"),
            BigInteger.Parse("97"),
            BigInteger.Parse("172"),
            BigInteger.Parse("309"),
            BigInteger.Parse("564"),
            BigInteger.Parse("1028"),
            BigInteger.Parse("1900"),
            BigInteger.Parse("3512"),
            BigInteger.Parse("6542"),
            BigInteger.Parse("12251"),
            BigInteger.Parse("23000"),
            BigInteger.Parse("43390"),
            BigInteger.Parse("82025"),
            BigInteger.Parse("155611"),
            BigInteger.Parse("295947"),
            BigInteger.Parse("564163"),
            BigInteger.Parse("1077871"),
            BigInteger.Parse("2063689"),
            BigInteger.Parse("3957809"),
            BigInteger.Parse("7603553"),
            BigInteger.Parse("14630843"),
            BigInteger.Parse("28192750"),
            BigInteger.Parse("54400028"),
            BigInteger.Parse("105097565"),
            BigInteger.Parse("203280221"),
            BigInteger.Parse("393615806"),
            BigInteger.Parse("762939111"),
            BigInteger.Parse("1480206279"),
            BigInteger.Parse("2874398515"),
            BigInteger.Parse("5586502348"),
            BigInteger.Parse("10866266172"),
            BigInteger.Parse("21151907950"),
            BigInteger.Parse("41203088796"),
            BigInteger.Parse("80316571436"),
            BigInteger.Parse("156661034233"),
            BigInteger.Parse("305761713237"),
            BigInteger.Parse("597116381732"),
            BigInteger.Parse("1166746786182"),
            BigInteger.Parse("2280998753949"),
            BigInteger.Parse("4461632979717"),
            BigInteger.Parse("8731188863470"),
            BigInteger.Parse("17094432576778"),
            BigInteger.Parse("33483379603407"),
            BigInteger.Parse("65612899915304"),
            BigInteger.Parse("128625503610475"),
            BigInteger.Parse("252252704148404"),
            BigInteger.Parse("494890204904784"),
            BigInteger.Parse("971269945245201"),
            BigInteger.Parse("1906879381028850"),
            BigInteger.Parse("3745011184713964"),
            BigInteger.Parse("7357400267843990"),
            BigInteger.Parse("14458792895301660"),
            BigInteger.Parse("28423094496953330"),
            BigInteger.Parse("55890484045084135"),
            BigInteger.Parse("109932807585469973"),
            BigInteger.Parse("216289611853439384"),
            BigInteger.Parse("425656284035217743"),
            BigInteger.Parse("837903145466607212"),
            BigInteger.Parse("1649819700464785589"),
            BigInteger.Parse("3249254387052557215"),
            BigInteger.Parse("6400771597544937806"),
            BigInteger.Parse("12611864618760352880"),
            BigInteger.Parse("24855455363362685793"),
            BigInteger.Parse("48995571600129458363"),
            BigInteger.Parse("96601075195075186855"),
            BigInteger.Parse("190499823401327905601"),
            BigInteger.Parse("375744164937699609596"),
            BigInteger.Parse("741263521140740113483"),
        };

        private static BigInteger[] data10 =
        {
            BigInteger.Parse("0"),
            BigInteger.Parse("4"),
            BigInteger.Parse("25"),
            BigInteger.Parse("168"),
            BigInteger.Parse("1229"),
            BigInteger.Parse("9592"),
            BigInteger.Parse("78498"),
            BigInteger.Parse("664579"),
            BigInteger.Parse("5761455"),
            BigInteger.Parse("50847534"),
            BigInteger.Parse("455052511"),
            BigInteger.Parse("4118054813"),
            BigInteger.Parse("37607912018"),
            BigInteger.Parse("346065536839"),
            BigInteger.Parse("3204941750802"),
            BigInteger.Parse("29844570422669"),
            BigInteger.Parse("279238341033925"),
            BigInteger.Parse("2623557157654233"),
            BigInteger.Parse("24739954287740860"),
            BigInteger.Parse("234057667276344607"),
            BigInteger.Parse("2220819602560918840"),
            BigInteger.Parse("21127269486018731928"),
            BigInteger.Parse("201467286689315906290"),
            BigInteger.Parse("1925320391606803968923"),
            BigInteger.Parse("18435599767349200867866"),
        };

        public PrimeCounting(int threads)
        {
            this.threads = threads;
            var n = sizeSmall;
            var i = 0;
            var count = 0;
            piSmall = new int[n];
            foreach (var p in new SieveOfEratosthenes())
            {
                while (i < p && i < n)
                    piSmall[i++] = count;
                if (i < n)
                    piSmall[i++] = ++count;
                if (i == n)
                    break;
            }
            var divisors = new DivisorsCollection(n);
            tauSumSmall = new int[n];
            tauSumSmall[0] = divisors[0];
            for (var j = 1; j < n; j++)
                tauSumSmall[j] = (tauSumSmall[j - 1] + divisors[j]) & 3;
            mobiusSmall = new MobiusCollection(sizeSmall, 0).ToArray();
        }

        public int Pi(int x)
        {
            if (x < piSmall.Length)
                return piSmall[x];
            return new PrimeCollection(x + 1, threads).Count;
        }

        public static BigInteger PiPowerOfTwo(int k)
        {
            return data2[k];
        }

        public static BigInteger PiPowerOfTen(int k)
        {
            return data10[k];
        }

        public int PiWithPowers(int x)
        {
            var sum = Pi(x);
            for (int j = 2; true; j++)
            {
                var root = IntegerMath.FloorRoot(x, j);
                if (root == 1)
                    break;
                sum += Pi(root);
            }
            return sum;
        }

        public int ParityOfPi(BigInteger x)
        {
            // pi(x) mod 2 = SumTwoToTheOmega(x)/2 mod 2- sum(pi(floor(x^(1/j)) mod 2)
            if (x < piSmall.Length)
                return piSmall[(int)x] % 2;
            var parity = SumTwoToTheOmega(x) / 2 % 2;
            for (int j = 2; true; j++)
            {
                var root = IntegerMath.FloorRoot(x, j);
                if (root == 1)
                    break;
                parity ^= ParityOfPi(root);
            }
            return parity;
        }

        private int SumTwoToTheOmega(BigInteger x)
        {
            // sum(2^w(d), d=[1,x]) mod 4 = sum(mu(d)TauSum(x/d^2), d=[1,floor(sqrt(x))]) mod 4
            var limit = IntegerMath.FloorSquareRoot(x);
            if (limit <= ulong.MaxValue)
                return SumTwoToTheOmega((UInt128)x, (ulong)limit);
            throw new NotImplementedException();
        }

        private int SumTwoToTheOmegaSimple(long x, int limit)
        {
            var mobius = new MobiusCollection(limit + 1, 2 * threads);
            var sum = 0;
            var nLast = (long)0;
            var tauLast = 0;
            for (var d = 1; d <= limit; d++)
            {
                var mu = mobius[d];
                if (mu != 0)
                {
                    var n = x / ((long)d * d);
                    var tau = n == nLast ? tauLast : TauSum((ulong)n);
                    if (mu == 1)
                        sum += tau;
                    else
                        sum += 4 - tau;
                    tauLast = tau;
                    nLast = n;
                }
            }
            return sum;
        }

        private uint blockSize = 1 << 24;
        private uint singleLimit1 = 10;
        private uint singleLimit2 = 100;

        private struct WorkItem
        {
            public ulong Min;
            public ulong Max;
        }

        private int SumTwoToTheOmega(UInt128 x, ulong limit)
        {
            var sum = 0;

            ulong d;
            for (d = 1; d < singleLimit1; d++)
            {
                var mu = mobiusSmall[d];
                if (mu != 0)
                {
                    var tau = TauSumParallel(x / (d * d));
                    if (mu == 1)
                        sum += tau;
                    else
                        sum += 4 - tau;
                }
            }

            var mobius = new MobiusRange((long)limit + 1, 0);
            var queue = new BlockingCollection<WorkItem>();
            var units = limit < (1 << 16) ? 1 : 100;
            var consumers = Math.Max(1, threads);
            var tasks = new Task[consumers];
            for (var consumer = 0; consumer < consumers; consumer++)
            {
                var thread = consumer;
                tasks[consumer] = Task.Factory.StartNew(() => ConsumeSumTwoToTheOmegaItems(thread, queue, mobius, x, ref sum));
            }

            for (d = singleLimit1; d < singleLimit2; d++)
            {
                if (mobiusSmall[d] != 0)
                    queue.Add(new WorkItem { Min = d, Max = d + 1 });
            }

            for (var unit = 0; unit < units; unit++)
            {
                var dmin = d;
                var dmax = unit == units - 1 ? limit + 1 : (ulong)Math.Exp((unit + 1) * Math.Log(limit + 1) / units);
                if (dmin >= dmax)
                    continue;
                if (dmax - dmin > blockSize)
                    break;
                queue.Add(new WorkItem { Min = dmin, Max = dmax });
                d = dmax;
            }

            while (d < limit + 1)
            {
                var dmin = d;
                var dmax = Math.Min(dmin + blockSize, limit + 1);
                queue.Add(new WorkItem { Min = dmin, Max = dmax });
                d = dmax;
            }

            queue.CompleteAdding();
            Task.WaitAll(tasks);
            return sum & 3;
        }

        private void ConsumeSumTwoToTheOmegaItems(int thread, BlockingCollection<WorkItem> queue, MobiusRange mobius, UInt128 x, ref int sum)
        {
            var values = new sbyte[blockSize];
            var item = default(WorkItem);
            while (queue.TryTake(out item, Timeout.Infinite))
            {
                if (item.Max == item.Min + 1 && item.Min < (ulong)mobiusSmall.Length)
                    values[0] = (sbyte)mobiusSmall[item.Min];
                else
                    mobius.GetValues((long)item.Min, (long)item.Max, values);
                Interlocked.Add(ref sum, SumTwoToTheOmega(values, x, item.Min, item.Max));
            }
        }

        private int SumTwoToTheOmega(sbyte[] mobius, UInt128 x, ulong dmin, ulong dmax)
        {
#if true
            if (x < ulong.MaxValue)
                return SumTwoToTheOmegaMedium(mobius, (ulong)x, (uint)dmin, (uint)dmax);
#endif
            return SumTwoToTheOmegaLarge(mobius, x, dmin, dmax);
        }

        private int SumTwoToTheOmegaMedium(sbyte[] mobius, ulong x, uint dmin, uint dmax)
        {
            var sum = 0;
            var last = (ulong)0;
            var current = x / ((ulong)dmax * dmax);
            var delta = dmax == 1 ? (long)0 : x / ((ulong)(dmax - 1) * (dmax - 1)) - current;
            var d = dmax - 1;
            var count = 0;
            while (d >= dmin)
            {
                var mu = mobius[d - dmin];
                if (mu != 0)
                {
                    var dSquared = (ulong)d * d;
                    var product = (current + delta) * dSquared;
                    if (product > x)
                    {
                        do
                        {
                            --delta;
                            product -= dSquared;
                        }
                        while (product > x);
                    }
                    else if (product + dSquared <= x)
                    {
                        ++delta;
                        product += dSquared;
                        if (product + dSquared <= x)
                            break;
                    }
                    current += delta;
                    Debug.Assert(x / dSquared == current);
                    if (current != last)
                    {
                        if ((count & 3) != 0)
                        {
                            var tau = TauSum(last);
                            if (count > 0)
                                sum += count * tau;
                            else
                                sum -= count * (4 - tau);
                        }
                        count = 0;
                        last = current;
                    }
                    count += mu;
                }
                --d;
            }
            while (d >= dmin)
            {
                var mu = mobius[d - dmin];
                if (mu != 0)
                {
                    current = x / ((ulong)d * d);
                    if (current != last)
                    {
                        var tau = TauSum(last);
                        if (count > 0)
                            sum += count * tau;
                        else
                            sum -= count * (4 - tau);
                        count = 0;
                        last = current;
                    }
                    count += mu;
                }
                --d;
            }
            {
                var tau = TauSum(last);
                if (count > 0)
                    sum += count * tau;
                else
                    sum -= count * (4 - tau);
            }
            return sum;
        }

        private const int safetyBits = 2;

        private int SumTwoToTheOmegaLarge(sbyte[] mobius, UInt128 x, ulong dmin, ulong dmax)
        {
            var sum = 0;
            var d = dmax - 1;
            var count = 0;
#if true
            {
                // Avoid 128-bit arithmetic as long as possible by
                // computing x / d as in TauInnerSum if the result
                // fits in 62 bits or so.  Then do the second
                // division using 64-bit arithmetic.
                var last = (ulong)0;
                var current = (ulong)(x / (d + 1));
                var delta = (ulong)(x / d) - current;
                var mod = (long)(x - (UInt128)current * (d + 1));
                var dmid = Math.Max(dmin, (ulong)(x >> (64 - safetyBits)));
                var deltad = delta * (d + 1);
                while (d >= dmid)
                {
                    deltad -= delta;
                    mod += (long)(current - deltad);
                    if (mod >= (long)d)
                    {
                        ++delta;
                        deltad += d;
                        mod -= (long)d;
                        if (mod >= (long)d)
                            break;
                    }
                    else if (mod < 0)
                    {
                        --delta;
                        deltad -= d;
                        mod += (long)d;
                    }
                    current += delta;
                    Debug.Assert(x / d == current);
                    var mu = mobius[d - dmin];
                    if (mu != 0)
                    {
                        var current2 = current / d;
                        Debug.Assert(x / d / d == current2);
                        if (current2 != last)
                        {
                            var tau = TauSum(last);
                            if (count > 0)
                                sum += count * tau;
                            else
                                sum -= count * (4 - tau);
                            count = 0;
                            last = current2;
                        }
                        count += mu;
                    }
                    --d;
                }
                {
                    var tau = TauSum(last);
                    if (count > 0)
                        sum += count * tau;
                    else
                        sum -= count * (4 - tau);
                }
            }
#endif
            {
                var last = (UInt128)0;
                while (d >= dmin)
                {
                    var mu = mobius[d - dmin];
                    if (mu != 0)
                    {
                        var current = x / d / d;
                        if (current != last)
                        {
                            var tau = TauSum(last);
                            if (count > 0)
                                sum += count * tau;
                            else
                                sum -= count * (4 - tau);
                            count = 0;
                            last = current;
                        }
                        count += mu;
                    }
                    --d;
                }
                {
                    var tau = TauSum(last);
                    if (count > 0)
                        sum += count * tau;
                    else
                        sum -= count * (4 - tau);
                }
            }
            return sum;
        }

        public int TauSumSimple(long y)
        {
            if (y == 0)
                return 0;
            var sum = 0;
            var n = (long)1;
            var squared = y - 1;
            while (true)
            {
                sum ^= (int)((y / n) & 1);
                squared -= 2 * n + 1;
                if (squared < 0)
                    break;
                ++n;
            }
            sum = 2 * sum - (int)((n * n) & 3);
            return sum & 3;
        }

        public int TauSumParallel(UInt128 y)
        {
            if (y < (ulong)tauSumSmall.Length)
                return tauSumSmall[(int)y];
            var sqrt = (ulong)0;
            var sum = TauSumInnerParallel(y, out sqrt);
            sum = 2 * sum - (int)((sqrt * sqrt) & 3);
            return sum & 3;
        }

        private int TauSum(ulong y)
        {
            // sum(tau(d), d=[1,y]) = 2 sum(y/d, d=[1,floor(sqrt(y))]) - floor(sqrt(y))^2
            if (y < (ulong)tauSumSmall.Length)
                return tauSumSmall[y];
            var sqrt = (uint)0;
            var sum = TauSumInner(y, out sqrt);
            sum = 2 * sum - (int)((sqrt * sqrt) & 3);
            return sum & 3;
        }

        public int TauSum(UInt128 y)
        {
            // sum(tau(d), d=[1,y]) = 2 sum(y/d, d=[1,floor(sqrt(y))]) - floor(sqrt(y))^2
            if (y < (ulong)tauSumSmall.Length)
                return tauSumSmall[(int)y];
            var sqrt = (ulong)0;
            var sum = TauSumInner(y, out sqrt);
            sum = 2 * sum - (int)((sqrt * sqrt) & 3);
            return sum & 3;
        }

        public int TauSumInnerSimple(long y, out int sqrt)
        {
            // Computes sum(floor(y/d), d=[1,floor(sqrt(y))]) mod 2.
            if (y == 0)
            {
                sqrt = 0;
                return 0;
            }
            var sum = 0;
            var n = (long)1;
            var squared = y - 1;
            while (true)
            {
                sum ^= (int)(y / n);
                squared -= 2 * n + 1;
                if (squared < 0)
                    break;
                ++n;
            }
            sqrt = (int)n;
            return sum & 1;
        }

        public int TauSumInner(ulong y, out uint sqrt)
        {
            // Computes sum(floor(y/d), d=[1,floor(sqrt(y))]) mod 2.
            // To avoid division, we start at the
            // end and proceed backwards using multiplication
            // with estimates.  We keep track of the
            // difference between steps and let
            // it increase by at most one each iteration.
            // As soon as it starts changing too quickly
            // we resort to the naive method.
            if (y <= uint.MaxValue)
                return TauSumInnerSmall((uint)y, out sqrt);
            return TauSumInnerMedium(y, out sqrt);
        }

        public int TauSumInner(UInt128 y, out ulong sqrt)
        {
#if true
            if (y <= uint.MaxValue)
            {
                var isqrt = (uint)0;
                var result = TauSumInnerSmall((uint)y, out isqrt);
                sqrt = (ulong)isqrt;
                return result;
            }
            if (y <= ulong.MaxValue)
            {
                var isqrt = (uint)0;
                var result = TauSumInnerMedium((ulong)y, out isqrt);
                sqrt = (ulong)isqrt;
                return result;
            }
#endif
            return TauSumInnerLarge(y, out sqrt);
        }

        public int TauSumInnerParallel(UInt128 y, out ulong sqrt)
        {
            sqrt = (ulong)IntegerMath.FloorSquareRoot((BigInteger)y);
            var sum = 0;

            // Create consumers.
            var queue = new BlockingCollection<WorkItem>();
            var consumers = Math.Max(1, threads);
            var tasks = new Task[consumers];
            for (var consumer = 0; consumer < consumers; consumer++)
            {
                var thread = consumer;
                tasks[consumer] = Task.Factory.StartNew(() => ConsumeTauInnerSumItems(thread, queue, y, ref sum));
            }

            // Produce work items.
            var slowLimit = (ulong)Math.Pow(sqrt, 0.8);
            TauSumInnerParallel(queue, 1, slowLimit);
            TauSumInnerParallel(queue, slowLimit, sqrt + 1);

            // Wait for completion.
            queue.CompleteAdding();
            Task.WaitAll(tasks);
            return sum & 1;
        }

        private const ulong maximumBatchSize = (ulong)1 << 28;

        private void TauSumInnerParallel(BlockingCollection<WorkItem> queue, ulong imin, ulong imax)
        {
            if (threads == 0)
                queue.Add(new WorkItem { Min = imin, Max = imax });
            else
            {
                var batchSize = Math.Min(maximumBatchSize, (imax - imin + (ulong)threads - 1) / (ulong)threads);
                for (var i = imin; i < imax; i += batchSize)
                    queue.Add(new WorkItem { Min = i, Max = Math.Min(i + batchSize, imax) });
            }
        }

        private void ConsumeTauInnerSumItems(int thread, BlockingCollection<WorkItem> queue, UInt128 y, ref int sum)
        {
            var item = default(WorkItem);
            while (queue.TryTake(out item, Timeout.Infinite))
                Interlocked.Add(ref sum, TauSumInnerWorker(y, item.Min, item.Max));
        }

        public int TauSumInnerSmall(uint y, out uint sqrt)
        {
            var limit = (uint)Math.Sqrt(y);
            var sum = (uint)0;
            var current = limit - 1;
            var delta = (uint)1;
            var i = limit;
            while (i > 0)
            {
                var product = (current + delta) * i;
                if (product > y)
                    --delta;
                else if (product + i <= y)
                {
                    ++delta;
                    if (product + 2 * i <= y)
                        break;
                }
                current += delta;
                Debug.Assert(y / i == current);
                sum ^= current;
                --i;
            }
            while (i >= 1)
            {
                sum ^= (uint)(y / i);
                --i;
            }
            sqrt = limit;
            return (int)(sum & 1);
        }

        public int TauSumInnerMedium(ulong y, out uint sqrt)
        {
            sqrt = (uint)Math.Sqrt(y);
            return TauSumInnerWorkerMedium(y, 1, sqrt + 1);
        }

        public int TauSumInnerLarge(UInt128 y, out ulong sqrt)
        {
            sqrt = (ulong)IntegerMath.FloorSquareRoot((BigInteger)y);
            return TauSumInnerWorkerLarge(y, 1, sqrt + 1);
        }

        private int TauSumInnerWorker(UInt128 y, ulong imin, ulong imax)
        {
#if true
            if (y < ulong.MaxValue)
                return TauSumInnerWorkerMedium((ulong)y, (uint)imin, (uint)imax);
#endif
#if false
            var timer = new Stopwatch();
            timer.Restart();
#endif
            var result = TauSumInnerWorkerLarge(y, imin, imax);
#if false
            Console.WriteLine("TauSumInnerWorker: y = {0}, imin = {1}, imax = {2}, elapsed = {3:F3}", y, imin, imax, (double)timer.ElapsedTicks / Stopwatch.Frequency * 1000);
#endif
            return result;
        }

        private int TauSumInnerWorkerMedium(ulong y, uint imin, uint imax)
        {
            var sum = (uint)0;
            var current = y / imax;
            var delta = y / (imax - 1) - current;
            var i = imax - 1;
            while (i >= imin)
            {
                var product = (current + delta) * i;
                if (product > y)
                    --delta;
                else if (product + i <= y)
                {
                    ++delta;
                    product += i;
                    if (product + i <= y)
                        break;
                }
                current += delta;
                Debug.Assert(y / i == current);
                sum ^= (uint)current;
                --i;
            }
            while (i >= imin)
            {
                sum ^= (uint)(y / i);
                --i;
            }
            return (int)(sum & 1);
        }

        private int TauSumInnerWorkerLarge(UInt128 y, ulong imin, ulong imax)
        {
#if false
            var sum = (uint)0;
            for (var i = imin; i < imax; i++)
                sum ^= (uint)(y / i);
            return (int)(sum & 1);
#endif
#if false
            var yRep = (MutableInteger)y;
            var xRep = yRep.Copy();
            var iRep = (MutableInteger)imin;
            var store = new MutableIntegerStore(4);
            var sum = (uint)0;
            for (var i = imin; i < imax; i++)
            {
                sum ^= xRep.Set(yRep).Divide(iRep, store).LeastSignificantWord;
                iRep.Increment();
            }
            return (int)(sum & 1);
#endif
#if false
            // The quantity floor(y/d) is odd iff y mod 2d >= d.
            var sum = (ulong)0;
            for (var i = imin; i < imax; i++)
                sum ^= y % (i << 1) - i;
            sum >>= 63;
            if (((imax - imin) & 1) != 0)
                sum ^= 1;
            return (int)(sum & 1);
#endif
#if false
            if (y.IsPowerOfTwo)
            {
                var uBits = y.GetBitLength() - 32;
                var sum = (uint)0;
                var y0 = (UInt128)y.LeastSignificantWord;
                var y12 = (ulong)(y >> 32);
                for (var i = imin; i < imax; i++)
                {
                    var y12mod = y12 % i;
                    var yPrime = y0 + ((y12 % i) << 32);
                    var shift = 64 - i.GetBitCount();
                    sum ^= (uint)(y / i);
                }
                return (int)(sum & 1);
            }
#endif
#if false
            var sum = (uint)0;
            var i = imax - 1;
            var current = (ulong)(y / (i + 1));
            var delta = (ulong)(y / i - current);
            var mod = (long)(y - (UInt128)current * (i + 1));
            var imid = Math.Max(imin, (ulong)(y >> (64 - safetyBits)));
            while (i >= imid)
            {
                mod += (long)(current - delta * i);
                current += delta;
                if (mod >= (long)i)
                {
                    ++delta;
                    ++current;
                    mod -= (long)i;
                    if (mod >= (long)i)
                        break;
                }
                else if (mod < 0)
                {
                    --delta;
                    --current;
                    mod += (long)i;
                }
                Debug.Assert(y / i == current);
                sum ^= (uint)current;
                --i;
            }
            while (i >= imin)
            {
                sum ^= (uint)(y / i);
                --i;
            }
            return (int)(sum & 1);
#endif
#if true
            var sum = (uint)0;
            var i = imax - 1;
            var current = (ulong)(y / (i + 1));
            var delta = (ulong)(y / i) - current;
            var mod = (long)(y - (UInt128)current * (i + 1));
            var imid = Math.Max(imin, (ulong)(y >> (64 - safetyBits)));
            var deltai = delta * (i + 1);
            while (i >= imid)
            {
                deltai -= delta;
                mod += (long)(current - deltai);
                if (mod >= (long)i)
                {
                    ++delta;
                    deltai += i;
                    mod -= (long)i;
                    if (mod >= (long)i)
                        break;
                }
                else if (mod < 0)
                {
                    --delta;
                    deltai -= i;
                    mod += (long)i;
                }
                current += delta;
                Debug.Assert(y / i == current);
                sum ^= (uint)current;
                --i;
            }
            while (i >= imin)
            {
                sum ^= (uint)(y / i);
                --i;
            }
            return (int)(sum & 1);
#endif
        }
    }
}
