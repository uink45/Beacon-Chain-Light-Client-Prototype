using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Nethermind.Decompose.Numerics
{
    public class MobiusRange : IArithmeticRange<sbyte, int>
    {
        private class Data
        {
            public long[] Products;
            public sbyte[] Values;
            public int[] Offsets;
            public long[] OffsetsSquared;

            public Data(int length)
            {
                Products = new long[blockSize];
                Values = new sbyte[blockSize];
                Offsets = new int[length];
                OffsetsSquared = new long[length];
            }
        }

        private const int blockSize = 1 << 16;

        private long size;
        private int threads;
        private int[] primes;
        private int cycleLimit;
        private int cycleSize;
        private long[] cycle;
        private ConcurrentQueue<Data> queue;

        public long Size { get { return size; } }
        public int Threads { get { return threads; } }

        public MobiusRange(long size, int threads)
        {
            this.size = size;
            this.threads = threads;
            var limit = (int)Math.Ceiling(Math.Sqrt(size));
            primes = new PrimeCollection(limit, 0).Select(p => (int)p).ToArray();
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
            if (kmax < kmin || kmax > size)
                throw new InvalidOperationException();
            if (kmin == kmax)
                return sum0;

            var pmax = GetPMax(kmax);
            var slast = kmax - offset - 1;

            if (threads == 0)
            {
                ProcessRange(pmax, kmin, kmax, values, sums, sum0, offset, null);
                return sums == null ? 0 : sums[slast];
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
                var last = (long)thread * batchSize - 1;
                if (last < sums.Length)
                    mabs[thread] = mabs[thread - 1] + sums[last] - sum0;
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

            return sums[slast];
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
            var klo = (int)(kstart - offset);
            var khi = (int)(kend - offset);
            for (var k = klo; k < khi; k++)
                sums[k] += abs;
        }

        private void CreateCycle()
        {
            // Create pre-sieved product and value cycles of small primes and their squares.
            var dmax = 3;
            cycleLimit = Math.Min(primes.Length, dmax);
            cycleSize = 1;
            for (var i = 0; i < cycleLimit; i++)
            {
                var p = (int)primes[i];
                cycleSize *= p * p;
            }
            cycle = new long[cycleSize];
            for (var i = 0; i < cycleSize; i++)
                cycle[i] = 1;
            for (var i = 0; i < cycleLimit; i++)
            {
                var p = primes[i];
                var pMinus = -p;
                for (var k = 0; k < cycleSize; k += p)
                    cycle[k] *= pMinus;
                var pSquared = (long)p * p;
                for (var k = (long)0; k < cycleSize; k += pSquared)
                    cycle[k] = 0;
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
            var cycleOffset = cycleSize - (int)(kstart % cycleSize);
            if (cycleOffset == cycleSize)
                cycleOffset = 0;
            offsets[0] = cycleOffset;

            // Determine the initial offset and offset squared of each prime divisor.
            for (var i = 1; i < pmax; i++)
            {
                var p = primes[i];
                var offset = p - (int)(kstart % p);
                if (offset == p)
                    offset = 0;
                offsets[i] = offset;
                var pSquared = (long)p * p;
                var offsetSquared = pSquared - kstart % pSquared;
                if (offsetSquared == pSquared)
                    offsetSquared = 0;
                offsetsSquared[i] = offsetSquared;
            }

            // Process the whole range in block-sized batches.
            for (var k = kstart; k < kend; k += blockSize)
            {
                var length = (int)Math.Min(blockSize, kend - k);
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

        private void SieveBlock(int pmax, long k0, int length, long[] products, int[] offsets, long[] offsetsSquared)
        {
            var cycleOffset = offsets[0];
            Array.Copy(cycle, cycleSize - cycleOffset, products, 0, Math.Min(length, cycleOffset));
            while (cycleOffset < length)
            {
                Array.Copy(cycle, 0, products, cycleOffset, Math.Min(cycleSize, length - cycleOffset));
                cycleOffset += cycleSize;
            }
            offsets[0] = cycleOffset - length;

            for (var i = cycleLimit; i < pmax; i++)
            {
                var p = primes[i];
                var pMinus = -p;
                int k;
                for (k = offsets[i]; k < length; k += p)
                    products[k] *= pMinus;
                offsets[i] = k - length;
                long kk = offsetsSquared[i];
                if (kk < length)
                {
                    var pSquared = (long)p * p;
                    do
                    {
                        products[kk] = 0;
                        kk += pSquared;
                    }
                    while (kk < length);
                }
                offsetsSquared[i] = kk - length;
            }
        }

        private int FinishBlock(long k0, int length, long[] products, sbyte[] values, long kmin, int[] sums, int sum0)
        {
            // Each product that is square-free can have at most one more
            // prime factor.  It has that factor if the absolute value of
            // the product is less than the full value.
            var k = k0;
            if (sums == null)
            {
                for (var i = 0; i < length; i++, k++)
                {
                    // Look ma, no branching.
                    var p = products[i];
                    var pos = -p >> 63; // pos = -1 if p > 0, zero otherwise
                    var neg = p >> 63; // neg = -1 if p is < 0, zero otherwise
                    var abs = (p + neg) ^ neg; // abs = |p|
                    var flip = (abs - k) >> 63; // flip = -1 if abs < k, zero otherwise
                    values[k - kmin] = (sbyte)(((neg - pos) ^ flip) - flip); // value = pos - neg if flip = -1, neg - pos otherwise
                    Debug.Assert(k == 0 || values[k - kmin] == Math.Sign(p) * (Math.Abs(p) != k ? -1 : 1));
                }
            }
            else if (values == null)
            {
                for (var i = 0; i < length; i++, k++)
                {
                    // Look ma, no branching.
                    var p = products[i];
                    var pos = -p >> 63; // pos = -1 if p > 0, zero otherwise
                    var neg = p >> 63; // neg = -1 if p is < 0, zero otherwise
                    var abs = (p + neg) ^ neg; // abs = |p|
                    var flip = (abs - k) >> 63; // flip = -1 if abs < k, zero otherwise
                    var value = ((neg - pos) ^ flip) - flip; // value = pos - neg if flip = -1, neg - pos otherwise
                    sum0 += (int)value;
                    sums[k - kmin] = sum0;
                    Debug.Assert(k == 0 || value == Math.Sign(p) * (Math.Abs(p) != k ? -1 : 1));
                }
            }
            else
            {
                for (var i = 0; i < length; i++, k++)
                {
                    // Look ma, no branching.
                    var p = products[i];
                    var pos = -p >> 63; // pos = -1 if p > 0, zero otherwise
                    var neg = p >> 63; // neg = -1 if p is < 0, zero otherwise
                    var abs = (p + neg) ^ neg; // abs = |p|
                    var flip = (abs - k) >> 63; // flip = -1 if abs < k, zero otherwise
                    var value = ((neg - pos) ^ flip) - flip; // value = pos - neg if flip = -1, neg - pos otherwise
                    values[k - kmin] = (sbyte)value;
                    sum0 += (int)value;
                    sums[k - kmin] = sum0;
                    Debug.Assert(k == 0 || value == Math.Sign(p) * (Math.Abs(p) != k ? -1 : 1));
                }
            }
            return sum0;
        }
    }
}
