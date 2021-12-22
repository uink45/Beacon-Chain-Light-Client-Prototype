using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Nethermind.Decompose.Numerics
{
    public class DivisorOddRangeAdditive : IArithmeticRange<ushort, ulong>
    {
        private class Data
        {
            public sbyte[] Products;
            public ushort[] Values;
            public int[] Offsets;
            public long[] OffsetsPower;

            public Data(int length)
            {
                Products = new sbyte[blockSize];
                Values = new ushort[blockSize];
                Offsets = new int[length];
                OffsetsPower = new long[length];
            }
        }

        private const int blockSize = 1 << 16;
        private const int cycleLimitMax = 4;
        private const int cycleSquaredLimitMax = 4;

        private long size;
        private int threads;
        private int[] primes;
        private sbyte[] logPrimes;
        private int cycleLimit;
        private int cycleSquaredLimit;
        private int cycleSize;
        private sbyte[] cycleProducts;
        private ushort[] cycleValues;
        private ConcurrentQueue<Data> queue;

        public long Size { get { return size; } }
        public int Threads { get { return threads; } }

        public DivisorOddRangeAdditive(long size, int threads)
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

        public void GetValues(long kmin, long kmax, ushort[] values)
        {
            GetValuesAndSums(kmin, kmax, values, null, 0, kmin);
        }

        public void GetValues(long kmin, long kmax, ushort[] values, long offset)
        {
            GetValuesAndSums(kmin, kmax, values, null, 0, offset);
        }

        public ulong GetSums(long kmin, long kmax, ulong[] sums, ulong sum0)
        {
            return GetValuesAndSums(kmin, kmax, null, sums, sum0, kmin);
        }

        public ulong GetSums(long kmin, long kmax, ulong[] sums, ulong sum0, long offset)
        {
            return GetValuesAndSums(kmin, kmax, null, sums, sum0, offset);
        }

        public ulong GetValuesAndSums(long kmin, long kmax, ushort[] values, ulong[] sums, ulong sum0)
        {
            return GetValuesAndSums(kmin, kmax, values, sums, sum0, kmin);
        }

        public ulong GetValuesAndSums(long kmin, long kmax, ushort[] values, ulong[] sums, ulong sum0, long offset)
        {
            // Validate operation.
            if (kmax < kmin || kmax > size || kmin % 2 != 1 || kmax % 2 != 1)
                throw new InvalidOperationException();
            if (kmin == kmax)
                return sum0;

            var pmax = GetPMax(kmax);
            var voffset = values == null ? -1 : offset;
            var soffset = sums == null ? -1 : offset;
            var slast = kmax - soffset - 2;

            if (threads <= 1)
            {
                ProcessRange(pmax, kmin, kmax, values, voffset, sums, soffset, sum0, null);
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
                tasks[thread] = Task.Factory.StartNew(() => ProcessRange(pmax, kstart, kend, values, voffset, sums, soffset, sum0, null));
            }
            Task.WaitAll(tasks);

            if (sums == null)
                return 0;

            // Collect summatory function totals for each batch.
            var mabs = new ulong[threads];
            mabs[0] = 0;
            for (var thread = 1; thread < threads; thread++)
            {
                var last = (long)thread * batchSize - 2;
                if (last < (sums.Length << 1))
                    mabs[thread] = mabs[thread - 1] + sums[last >> 1] - sum0;
            }

            // Convert relative summatory function values into absolute summatory function.
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

        public void GetValues(long kmin, long kmax, Action<long, long, ushort[]> action)
        {
            ProcessRange(GetPMax(kmax), kmin, kmax, null, -1, null, -1, 0, action);
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

        private void BumpRange(ulong abs, long kstart, long kend, long offset, ulong[] sums)
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
            cycleProducts = new sbyte[cycleSize];
            cycleValues = new ushort[cycleSize];
            for (var i = 0; i < cycleSize; i++)
                cycleValues[i] = 1;
            for (var i = 1; i < cycleLimit; i++)
            {
                var p = primes[i];
                var logP = logPrimes[i];
                for (var k = p / 2; k < cycleSize; k += p)
                {
                    cycleProducts[k] += logP;
                    cycleValues[k] <<= 1;
                }
                var pSquared = (long)p * p;
                if (i < cycleSquaredLimit)
                {
                    for (var k = pSquared / 2; k < cycleSize; k += pSquared)
                    {
                        cycleProducts[k] += logP;
                        cycleValues[k] = (ushort)(cycleValues[k] / 2 * 3);
                    }
                }
            }
        }

        private void ProcessRange(int pmax, long kstart, long kend, ushort[] values, long kmin, ulong[] sums, long smin, ulong sum0, Action<long, long, ushort[]> action)
        {
            // Acquire resources.
            Data data;
            if (!queue.TryDequeue(out data))
                data = new Data(Math.Max(1, primes.Length));
            var products = data.Products;
            var offsets = data.Offsets;
            var offsetsPower = data.OffsetsPower;
            var onlySums = false;
            if (values == null)
            {
                values = data.Values;
                if (sums != null)
                    onlySums = true;
            }

            // Determine the initial offset and offset squared of each prime divisor.
            for (var i = 1; i < pmax; i++)
            {
                var p = primes[i];
                var offset = p - (int)(((kstart + p) >> 1) % p);
                if (offset == p)
                    offset = 0;
                offsets[i] = offset;
                Debug.Assert((kstart + 2 * offset) % p == 0);
                var pPower = i < cycleSquaredLimit ? (long)p * p * p : (long)p * p;
                var offsetPower = pPower - ((kstart + pPower) >> 1) % pPower;
                if (offsetPower == pPower)
                    offsetPower = 0;
                offsetsPower[i] = offsetPower;
            }

            // Determine the initial cycle offset.
            var cycleOffset = cycleSize - (int)((kstart >> 1) % cycleSize);
            if (cycleOffset == cycleSize)
                cycleOffset = 0;
            offsets[0] = cycleOffset;

            // Process the whole range in block-sized batches.
            for (var k = kstart; k < kend; k += blockSize)
            {
                var voffset = kmin == -1 ? k : kmin;
                var soffset = smin == -1 ? k : smin;
                var length = (int)Math.Min(blockSize, kend - k) >> 1;
                SieveBlock(pmax, k, length, products, values, offsets, offsetsPower, voffset);
                sum0 = FinishBlock(k, length, products, values, voffset, sums, soffset, sum0, onlySums);

                // Perform action, if any.
                if (action != null)
                    action(k, k + length, values);
            }

            // Release resources.
            queue.Enqueue(data);
        }

        private void SieveBlock(int pmax, long k0, int length, sbyte[] products, ushort[] values, int[] offsets, long[] offsetsPower, long kmin)
        {
            // Initialize and pre-sieve product and value arrays from cycles.
            var koffset = (k0 - kmin) >> 1;
            var cycleOffset = offsets[0];
            Debug.Assert(primes.Where((i, p) => i > 0 && i < cycleLimit).All(p => (k0 + 2 * cycleOffset) % p == 1));
            Array.Copy(cycleProducts, cycleSize - cycleOffset, products, 0, Math.Min(length, cycleOffset));
            Array.Copy(cycleValues, cycleSize - cycleOffset, values, koffset, Math.Min(length, cycleOffset));
            while (cycleOffset < length)
            {
                Array.Copy(cycleProducts, 0, products, cycleOffset, Math.Min(cycleSize, length - cycleOffset));
                Array.Copy(cycleValues, 0, values, koffset + cycleOffset, Math.Min(cycleSize, length - cycleOffset));
                cycleOffset += cycleSize;
            }
            offsets[0] = cycleOffset - length;

            // Handle small primes individually to allow the operations
            // to be optimized by the JIT compiler.
            if (1 < cycleSquaredLimit)
            {
                // Handle multiples of 3^3.
                const int i = 1;
                const int p = 3;
                const int pCubed = p * p * p;
                var logP = logPrimes[i];
                var offset = (int)offsetsPower[i];
                var quotient0 = (k0 + 2 * offset) / pCubed;
                int kk;
                for (kk = offset; kk < length; kk += pCubed, quotient0 += 2)
                {
                    Debug.Assert((k0 + 2 * kk) % pCubed == 0);
                    products[kk] += logP;
                    var quotient = quotient0;
                    int exponent;
                    for (exponent = 3; quotient % p == 0; exponent++)
                    {
                        Debug.Assert(quotient / p > 0);
                        products[kk] += logP;
                        quotient /= p;
                    }
                    values[kk + koffset] = (ushort)(values[kk + koffset] / 3 * (exponent + 1));
                }
                offsetsPower[i] = kk - length;
            }
            if (2 < cycleSquaredLimit)
            {
                // Handle multiples of 5^3.
                const int i = 2;
                const int p = 5;
                const int pCubed = p * p * p;
                var logP = logPrimes[i];
                var offset = (int)offsetsPower[i];
                var quotient0 = (k0 + 2 * offset) / pCubed;
                int kk;
                for (kk = offset; kk < length; kk += pCubed, quotient0 += 2)
                {
                    Debug.Assert((k0 + 2 * kk) % pCubed == 0);
                    products[kk] += logP;
                    var quotient = quotient0;
                    int exponent;
                    for (exponent = 3; quotient % p == 0; exponent++)
                    {
                        Debug.Assert(quotient / p > 0);
                        products[kk] += logP;
                        quotient /= p;
                    }
                    values[kk + koffset] = (ushort)(values[kk + koffset] / 3 * (exponent + 1));
                }
                offsetsPower[i] = kk - length;
            }
            if (3 < cycleSquaredLimit)
            {
                // Handle multiples of 7^3.
                const int i = 3;
                const int p = 7;
                const int pCubed = p * p * p;
                var logP = logPrimes[i];
                var offset = (int)offsetsPower[i];
                var quotient0 = (k0 + 2 * offset) / pCubed;
                int kk;
                for (kk = offset; kk < length; kk += pCubed, quotient0 += 2)
                {
                    Debug.Assert((k0 + 2 * kk) % pCubed == 0);
                    products[kk] += logP;
                    var quotient = quotient0;
                    int exponent;
                    for (exponent = 3; quotient % p == 0; exponent++)
                    {
                        Debug.Assert(quotient / p > 0);
                        products[kk] += logP;
                        quotient /= p;
                    }
                    values[kk + koffset] = (ushort)(values[kk + koffset] / 3 * (exponent + 1));
                }
                offsetsPower[i] = kk - length;
            }

            // Sieve remaining primes.
            for (var i = cycleSquaredLimit; i < pmax; i++)
            {
                var p = primes[i];
                var logP = logPrimes[i];

                // Handle multiples of p.
                if (i >= cycleLimit)
                {
                    int k;
                    for (k = offsets[i]; k < length; k += p)
                    {
                        Debug.Assert((k0 + 2 * k) % p == 0);
                        products[k] += logP;
                        values[k + koffset] <<= 1;
                    }
                    offsets[i] = k - length;
                }

                // Handle multiples of p^2.
                long kk = offsetsPower[i];
                if (kk < length)
                {
                    var pSquared = (long)p * p;
                    var quotient0 = (k0 + 2 * kk) / pSquared;
                    do
                    {
                        Debug.Assert((k0 + 2 * kk) % pSquared == 0);
                        products[kk] += logP;
                        var quotient = quotient0;
                        int exponent;
                        for (exponent = 2; quotient % p == 0; exponent++)
                        {
                            products[kk] += logP;
                            quotient /= p;
                        }
                        values[kk + koffset] = (ushort)(values[kk + koffset] / 2 * (exponent + 1));
                        kk += pSquared;
                        quotient0 += 2;
                    }
                    while (kk < length);
                }
                offsetsPower[i] = kk - length;
            }
        }

        private ulong FinishBlock(long k0, int length, sbyte[] products, ushort[] values, long kmin, ulong[] sums, long smin, ulong sum0, bool onlySums)
        {
            // Each product can have at most one more prime factor.
            // It has that factor if the value of the product is
            // less than the full value.
            var k = k0;
            var kmax = k + 2 * length;
            var log2 = IntegerMath.CeilingLogBaseTwo(k);
            var next = Math.Min((long)1 << log2, kmax - 2);
            if (onlySums)
            {
                var kk = 0;
                while (k < kmax)
                {
                    while (k <= next)
                    {
                        // Look ma, no branching.
                        Debug.Assert(log2 == IntegerMath.CeilingLogBaseTwo(k));
                        var value = (uint)values[kk];
                        sums[(k - smin) >> 1] = sum0 += value + ((uint)((products[kk] - log2) >> 31) & value);
                        Debug.Assert(k == k0 || (int)(sums[(k - smin) >> 1] - sums[(k - smin - 2) >> 1]) == (products[kk] > log2 - 1 ? value : 2 * value));
                        k += 2;
                        ++kk;
                    }
                    ++log2;
                    next = Math.Min(next << 1, kmax - 2);
                }
            }
            else if (sums == null)
            {
                while (k < kmax)
                {
                    while (k <= next)
                    {
                        // Look ma, no branching.
                        Debug.Assert(log2 == IntegerMath.CeilingLogBaseTwo(k));
                        var kk = (k - kmin) >> 1;
                        var value = (uint)values[kk];
                        sum0 += values[kk] = (ushort)(value + ((uint)((products[(k - k0) >> 1] - log2) >> 31) & value));
                        Debug.Assert(values[kk] == (products[(k - k0) >> 1] > log2 - 1 ? value : 2 * value));
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
                        Debug.Assert(log2 == IntegerMath.CeilingLogBaseTwo(k));
                        var kk = (k - kmin) >> 1;
                        var value = (uint)values[kk];
                        sums[(k - smin) >> 1] = sum0 += values[kk] = (ushort)(value + ((uint)((products[(k - k0) >> 1] - log2) >> 31) & value));
                        Debug.Assert(values[kk] == (products[(k - k0) >> 1] > log2 - 1 ? value : 2 * value));
                        Debug.Assert(k == k0 || (int)(sums[(k - smin) >> 1] - sums[(k - smin - 2) >> 1]) == (products[(k - k0) >> 1] > log2 - 1 ? value : 2 * value));
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
