using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Nethermind.Decompose.Numerics
{
    public class MobiusOddRangeAdditive : IArithmeticRange<sbyte, int>
    {
        private class Data
        {
            public sbyte[] Products;
            public sbyte[] Values;
            public int[] Offsets;
            public long[] OffsetsSquared;

            public Data(int length)
            {
                Products = new sbyte[blockSize];
                Values = new sbyte[blockSize];
                Offsets = new int[length];
                OffsetsSquared = new long[length];
            }
        }

        private const int blockSize = 1 << 17;
        private const int cycleLimitMax = 7;
        private const int cycleSquaredLimitMax = 2;
        private const sbyte squareSentinel = sbyte.MinValue;

        private long size;
        private int threads;
        private int[] primes;
        private sbyte[] logPrimes;
        private int cycleLimit;
        private int cycleSquaredLimit;
        private int cycleSize;
        private sbyte[] cycle;
        private ConcurrentQueue<Data> queue;

        public long Size { get { return size; } }
        public int Threads { get { return threads; } }

        public MobiusOddRangeAdditive(long size, int threads)
        {
            this.size = size;
            this.threads = threads;
            var limit = (int)Math.Ceiling(Math.Sqrt(size));
            primes = new PrimeCollection(limit, 0).Select(p => (int)p).ToArray();
            logPrimes = primes.Select(p => (sbyte)(IntegerMath.CeilingLogBaseTwo(p) | 1)).ToArray();
            CreateCycle();
            var arrayLength = Math.Max(1, threads);
            queue = new ConcurrentQueue<Data>();
        }

        public void GetValues(long kmin, long kmax, sbyte[] values)
        {
            GetValuesAndSums(kmin, kmax, values, null, 0, kmin);
        }

        public void GetValues(long kmin, long kmax, sbyte[] values, long offset)
        {
            GetValuesAndSums(kmin, kmax, values, null, 0, offset);
        }

        public int GetSums(long kmin, long kmax, int[] sums, int sum0)
        {
            return GetValuesAndSums(kmin, kmax, null, sums, sum0, kmin);
        }

        public int GetSums(long kmin, long kmax, int[] sums, int sum0, long offset)
        {
            return GetValuesAndSums(kmin, kmax, null, sums, sum0, offset);
        }

        public int GetValuesAndSums(long kmin, long kmax, sbyte[] values, int[] sums, int sum0)
        {
            return GetValuesAndSums(kmin, kmax, values, sums, sum0, kmin);
        }

        public int GetValuesAndSums(long kmin, long kmax, sbyte[] values, int[] sums, int sum0, long offset)
        {
            // Validate operation.
            if (kmax < kmin || kmax > size || kmin % 2 != 1 || kmax % 2 != 1)
                throw new InvalidOperationException();
            if (kmin == kmax)
                return sum0;

            var pmax = GetPMax(kmax);
            var slast = kmax - offset - 2;

            if (threads == 0)
            {
                ProcessRange(pmax, kmin, kmax, values, sums, sum0, offset, null);
                return sums == null ? 0 : sums[slast >> 1];
            }

            // Choose batch size such that: batchSize*threads >= length and batchSize is even.
            var tasks = new Task[threads];
            var length = kmax - kmin;
            var batchSize = ((length + threads - 1) / threads + 1) & ~1;
            for (var thread = 0; thread < threads; thread++)
            {
                var kstart = (long)thread * batchSize + kmin;
                var kend = Math.Min(kstart + batchSize, kmax);
                tasks[thread] = Task.Factory.StartNew(() => ProcessRange(pmax, kstart, kend, values, sums, sum0, offset, null));
            }
            Task.WaitAll(tasks);

            if (sums == null)
                return 0;

            // Collect and sum Mertens function totals for each batch.
            var mabs = new int[threads];
            mabs[0] = 0;
            for (var thread = 1; thread < threads; thread++)
            {
                var last = (long)thread * batchSize - 2;
                if (last < (sums.Length << 1))
                    mabs[thread] = mabs[thread - 1] + sums[last >> 1] - sum0;
            }

            // Convert relative Mertens function values into absolute Mertens values.
            for (var thread = 1; thread < threads; thread++)
            {
                var index = thread;
                var kstart = (long)thread * batchSize + kmin;
                var kend = Math.Min(kstart + batchSize, kmax);
                tasks[thread] = Task.Factory.StartNew(() => BumpRange(mabs[index], kstart, kend, offset, sums));
            }
            Task.WaitAll(tasks);

            return sums[slast >> 1];
        }

        public void GetValues(long kmin, long kmax, Action<long, long, sbyte[]> action)
        {
            ProcessRange(GetPMax(kmax), kmin, kmax, null, null, 0, -1, action);
        }

        private int GetPMax(long kmax)
        {
            // Determine the number of primes appropriate for values up to kmax.
            var plimit = (int)Math.Ceiling(Math.Sqrt(kmax));
            var pmax = primes.Length;
            while (pmax > 0 && primes[pmax - 1] > plimit)
                --pmax;
            return pmax;
        }

        private void BumpRange(int abs, long kstart, long kend, long offset, int[] sums)
        {
            var klo = (int)(kstart - offset) >> 1;
            var khi = (int)(kend - offset) >> 1;
            for (var k = klo; k < khi; k++)
                sums[k] += abs;
        }

        private void CreateCycle()
        {
            // Create pre-sieved product and value cycles of small primes and their squares.
            cycleLimit = Math.Min(primes.Length, cycleLimitMax);
            cycleSquaredLimit = Math.Min(cycleLimit, cycleSquaredLimitMax);
            cycleSize = 1;
            for (var i = 1; i < cycleLimit; i++)
            {
                var p = primes[i];
                cycleSize *= p;
                if (i < cycleSquaredLimit)
                    cycleSize *= p;
            }
            cycle = new sbyte[cycleSize];
            for (var i = 1; i < cycleLimit; i++)
            {
                var p = primes[i];
                var logP = logPrimes[i];
                for (var k = p / 2; k < cycleSize; k += p)
                    cycle[k] += logP;
                if (i < cycleSquaredLimit)
                {
                    var pSquared = (long)p * p;
                    for (var k = pSquared / 2; k < cycleSize; k += pSquared)
                        cycle[k] = squareSentinel;
                }
            }
        }

        private void ProcessRange(int pmax, long kstart, long kend, sbyte[] values, int[] sums, int sum0, long kmin, Action<long, long, sbyte[]> action)
        {
            // Acquire resources.
            Data data;
            if (!queue.TryDequeue(out data))
                data = new Data(Math.Max(1, primes.Length));
            var products = data.Products;
            var offsets = data.Offsets;
            var offsetsSquared = data.OffsetsSquared;
            if (action != null)
                values = data.Values;

            // Determine the initial cycle offset.
            var cycleOffset = cycleSize - (int)((kstart >> 1) % cycleSize);
            if (cycleOffset == cycleSize)
                cycleOffset = 0;
            offsets[0] = cycleOffset;

            // Determine the initial offset and offset squared of each prime divisor.
            for (var i = 1; i < pmax; i++)
            {
                var p = primes[i];
                var offset = p - (int)(((kstart + p) >> 1) % p);
                if (offset == p)
                    offset = 0;
                Debug.Assert((kstart + 2 * offset) % p == 0);
                offsets[i] = offset;
                var pSquared = (long)p * p;
                var offsetSquared = pSquared - ((kstart + pSquared) >> 1) % pSquared;
                if (offsetSquared == pSquared)
                    offsetSquared = 0;
                offsetsSquared[i] = offsetSquared;
            }

            // Process the whole range in block-sized batches.
            for (var k = kstart; k < kend; k += blockSize)
            {
                var length = (int)Math.Min(blockSize, kend - k) >> 1;
                var offset = kmin == -1 ? k : kmin;
                SieveBlock(pmax, k, length, products, offsets, offsetsSquared);
                sum0 = FinishBlock(k, length, products, values, offset, sums, sum0);

                // Perform action, if any.
                if (action != null)
                    action(k, k + length, values);
            }

            // Release resources.
            queue.Enqueue(data);
        }

        private void SieveBlock(int pmax, long k0, int length, sbyte[] products, int[] offsets, long[] offsetsSquared)
        {
            var cycleOffset = offsets[0];
            Debug.Assert(primes.Where((i, p) => i > 0 && i < cycleLimit).All(p => (k0 + 2 * cycleOffset) % p == 1));
            Array.Copy(cycle, cycleSize - cycleOffset, products, 0, Math.Min(length, cycleOffset));
            while (cycleOffset < length)
            {
                Array.Copy(cycle, 0, products, cycleOffset, Math.Min(cycleSize, length - cycleOffset));
                cycleOffset += cycleSize;
            }
            offsets[0] = cycleOffset - length;

            for (var i = cycleSquaredLimit; i < pmax; i++)
            {
                var p = primes[i];
                if (i >= cycleLimit)
                {
                    var logP = logPrimes[i];
                    int k;
                    for (k = offsets[i]; k < length; k += p)
                    {
                        Debug.Assert((k0 + 2 * k) % p == 0);
                        products[k] += logP;
                    }
                    offsets[i] = k - length;
                }
                long kk = offsetsSquared[i];
                if (kk < length)
                {
                    var pSquared = (long)p * p;
                    do
                    {
                        Debug.Assert((k0 + 2 * kk) % pSquared == 0);
                        products[kk] = squareSentinel;
                        kk += pSquared;
                    }
                    while (kk < length);
                }
                offsetsSquared[i] = kk - length;
            }
        }

        private int FinishBlock(long k0, int length, sbyte[] products, sbyte[] values, long kmin, int[] sums, int sum0)
        {
            // Each product of a squareful number is less than zero.
            // Each product of a square-free number can have at most one
            // more prime factor.  It has that factor if the value of
            // the product is less half than the full value.
            var k = k0;
            var kmax = k + 2 * length;
            var log2 = IntegerMath.CeilingLogBaseTwo(k) - 1;
            var next = Math.Min((long)1 << (log2 + 1), kmax - 2);
            if (sums == null)
            {
                while (k < kmax)
                {
                    while (k <= next)
                    {
                        // Look ma, no branching.
                        Debug.Assert(log2 == IntegerMath.CeilingLogBaseTwo(k) - 1);
                        var p = (int)products[(k - k0) >> 1];
                        var flip = (log2 - p) >> 31; // flip = -1 if log2 < p, zero otherwise
                        values[(k - kmin) >> 1] = (sbyte)((((((p & 1) << 1) - 1) ^ flip) - flip) & ~(p >> 31));
                        Debug.Assert(values[(k - kmin) >> 1] == (sbyte)(p < 0 ? 0 : p > log2 ? 1 - 2 * (p & 1) : 2 * (p & 1) - 1));
                        k += 2;
                    }
                    ++log2;
                    next = Math.Min(next << 1, kmax - 2);
                }
            }
            else if (values == null)
            {
                while (k < kmax)
                {
                    while (k <= next)
                    {
                        // Look ma, no branching.
                        Debug.Assert(log2 == IntegerMath.CeilingLogBaseTwo(k) - 1);
                        var p = (int)products[(k - k0) >> 1];
                        var flip = (log2 - p) >> 31; // flip = -1 if log2 < p, zero otherwise
                        sums[(k - kmin) >> 1] = sum0 += (((((p & 1) << 1) - 1) ^ flip) - flip) & ~(p >> 31);
                        Debug.Assert(k == k0 || sums[(k - kmin) >> 1] - sums[(k - kmin - 2) >> 1] == (sbyte)(p < 0 ? 0 : p > log2 ? 1 - 2 * (p & 1) : 2 * (p & 1) - 1));
                        k += 2;
                    }
                    ++log2;
                    next = Math.Min(next << 1, kmax - 2);
                }
            }
            else
            {
                while (k < kmax)
                {
                    while (k <= next)
                    {
                        // Look ma, no branching.
                        Debug.Assert(log2 == IntegerMath.CeilingLogBaseTwo(k) - 1);
                        var p = (int)products[(k - k0) >> 1];
                        var flip = (log2 - p) >> 31; // flip = -1 if log2 < p, zero otherwise
                        var value = (((((p & 1) << 1) - 1) ^ flip) - flip) & ~(p >> 31);
                        var kk = (k - kmin) >> 1;
                        sums[kk] = sum0 += value;
                        values[kk] = (sbyte)value;
                        Debug.Assert(values[(k - kmin) >> 1] == (sbyte)(p < 0 ? 0 : p > log2 ? 1 - 2 * (p & 1) : 2 * (p & 1) - 1));
                        Debug.Assert(values[(k - kmin) >> 1] == IntegerMath.Mobius(k));
                        k += 2;
                    }
                    ++log2;
                    next = Math.Min(next << 1, kmax - 2);
                }
            }
            return sum0;
        }
    }
}
