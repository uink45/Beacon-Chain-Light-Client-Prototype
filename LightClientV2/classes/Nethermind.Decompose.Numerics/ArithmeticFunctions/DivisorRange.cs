using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Nethermind.Decompose.Numerics
{
    public class DivisorRange : IArithmeticRange<ushort, ulong>
    {
        // Using a ushort for the divisor function is valid up to 10^17.
        // See: http://wwwhomes.uni-bielefeld.de/achim/highly.txt
        private class Data
        {
            public long[] Products;
            public ushort[] Values;
            public int[] Offsets;
            public long[] OffsetsPower;

            public Data(int length)
            {
                Products = new long[blockSize];
                Values = new ushort[blockSize];
                Offsets = new int[length];
                OffsetsPower = new long[length];
            }
        }

        private const int blockSize = 1 << 14;

        private long size;
        private int threads;
        private int[] primes;
        private int cycleLimit;
        private int cycleSize;
        private long[] cycleProducts;
        private ushort[] cycleValues;
        private ConcurrentQueue<Data> queue;

        public long Size { get { return size; } }
        public int Threads { get { return threads; } }

        public DivisorRange(long size, int threads)
        {
            this.size = size;
            this.threads = threads;
            var limit = (int)Math.Ceiling(Math.Sqrt(size));
            primes = new PrimeCollection(limit, 0).Select(p => (int)p).ToArray();
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
            if (kmax < kmin || kmax > size)
                throw new InvalidOperationException();
            if (kmin == kmax)
                return sum0;

            var pmax = GetPMax(kmax);
            var voffset = values == null ? -1 : offset;
            var soffset = sums == null ? -1 : offset;
            var slast = kmax - soffset - 1;

            if (threads == 0)
            {
                ProcessRange(pmax, kmin, kmax, values, voffset, sums, soffset, sum0, null);
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
                var last = (long)thread * batchSize - 1;
                if (last < sums.Length)
                    mabs[thread] = mabs[thread - 1] + sums[last] - sum0;
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

            return sums[slast];
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
            cycleProducts = new long[cycleSize];
            cycleValues = new ushort[cycleSize];
            for (var i = 0; i < cycleSize; i++)
            {
                cycleProducts[i] = 1;
                cycleValues[i] = 1;
            }
            for (var i = 0; i < cycleLimit; i++)
            {
                var p = primes[i];
                for (var k = 0; k < cycleSize; k += p)
                {
                    cycleProducts[k] *= p;
                    cycleValues[k] <<= 1;
                }
                var pSquared = (long)p * p;
                for (var k = (long)0; k < cycleSize; k += pSquared)
                {
                    cycleProducts[k] *= p;
                    cycleValues[k] = (ushort)(cycleValues[k] / 2 * 3);
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
            for (var i = 0; i < pmax; i++)
            {
                var p = primes[i];
                var offset = p - (int)(kstart % p);
                if (offset == p)
                    offset = 0;
                offsets[i] = offset;
                var pPower = i < cycleLimit ? (long)p * p * p : (long)p * p;
                var offsetPower = pPower - kstart % pPower;
                if (offsetPower == pPower)
                    offsetPower = 0;
                offsetsPower[i] = offsetPower;
            }

            // Determine the initial cycle offset.
            var cycleOffset = cycleSize - (int)(kstart % cycleSize);
            if (cycleOffset == cycleSize)
                cycleOffset = 0;
            offsets[0] = cycleOffset;

            // Process the whole range in block-sized batches.
            for (var k = kstart; k < kend; k += blockSize)
            {
                var voffset = kmin == -1 ? k : kmin;
                var soffset = smin == -1 ? k : smin;
                var length = (int)Math.Min(blockSize, kend - k);
                SieveBlock(pmax, k, length, products, values, offsets, offsetsPower, voffset);
                sum0 = FinishBlock(k, length, products, values, voffset, sums, soffset, sum0, onlySums);

                // Perform action, if any.
                if (action != null)
                    action(k, k + length, values);
            }

            // Release resources.
            queue.Enqueue(data);
        }

        private void SieveBlock(int pmax, long k0, int length, long[] products, ushort[] values, int[] offsets, long[] offsetsPower, long kmin)
        {
            // Initialize and pre-sieve product and value arrays from cycles.
            var koffset = k0 - kmin;
            var cycleOffset = offsets[0];
            Array.Copy(cycleProducts, cycleSize - cycleOffset, products, 0, Math.Min(length, cycleOffset));
            Array.Copy(cycleValues, cycleSize - cycleOffset, values, koffset, Math.Min(length, cycleOffset));
            while (cycleOffset < length)
            {
                Array.Copy(cycleProducts, 0, products, cycleOffset, Math.Min(cycleSize, length - cycleOffset));
                Array.Copy(cycleValues, 0, values, koffset + cycleOffset, Math.Min(cycleSize, length - cycleOffset));
                cycleOffset += cycleSize;
            }
            offsets[0] = cycleOffset - length;

            // Handle small primes.
            if (0 < cycleLimit)
            {
                // Handle multiples of 2^3.
                const int i = 0;
                const int p = 2;
                const int pCubed = p * p * p;
                int kk;
                for (kk = (int)offsetsPower[i]; kk < length; kk += pCubed)
                {
                    Debug.Assert((k0 + kk) % pCubed == 0);
                    products[kk] *= p;
                    var quotient = (k0 + kk) / pCubed;
                    int exponent;
                    for (exponent = 3; quotient % p == 0; exponent++)
                    {
                        Debug.Assert(quotient / p > 0);
                        products[kk] *= p;
                        quotient /= p;
                    }
                    values[kk + koffset] = (ushort)(values[kk + koffset] / 3 * (exponent + 1));
                }
                offsetsPower[i] = kk - length;
            }
            if (1 < cycleLimit)
            {
                // Handle multiples of 3^3.
                const int i = 1;
                const int p = 3;
                const int pCubed = p * p * p;
                int kk;
                for (kk = (int)offsetsPower[i]; kk < length; kk += pCubed)
                {
                    Debug.Assert((k0 + kk) % pCubed == 0);
                    products[kk] *= p;
                    var quotient = (k0 + kk) / pCubed;
                    int exponent;
                    for (exponent = 3; quotient % p == 0; exponent++)
                    {
                        Debug.Assert(quotient / p > 0);
                        products[kk] *= p;
                        quotient /= p;
                    }
                    values[kk + koffset] = (ushort)(values[kk + koffset] / 3 * (exponent + 1));
                }
                offsetsPower[i] = kk - length;
            }
            if (2 < cycleLimit)
            {
                // Handle multiples of 5^3.
                const int i = 2;
                const int p = 5;
                const int pCubed = p * p * p;
                int kk;
                for (kk = (int)offsetsPower[i]; kk < length; kk += pCubed)
                {
                    Debug.Assert((k0 + kk) % pCubed == 0);
                    products[kk] *= p;
                    var quotient = (k0 + kk) / pCubed;
                    int exponent;
                    for (exponent = 3; quotient % p == 0; exponent++)
                    {
                        Debug.Assert(quotient / p > 0);
                        products[kk] *= p;
                        quotient /= p;
                    }
                    values[kk + koffset] = (ushort)(values[kk + koffset] / 3 * (exponent + 1));
                }
                offsetsPower[i] = kk - length;
            }

            // Sieve remaining primes.
            for (var i = cycleLimit; i < pmax; i++)
            {
                var p = primes[i];

                // Handle multiples of p.
                int k;
                for (k = offsets[i]; k < length; k += p)
                {
                    products[k] *= p;
                    values[k + koffset] <<= 1;
                }
                offsets[i] = k - length;

                // Handle multiples of p^2.
                long kk = offsetsPower[i];
                if (kk < length)
                {
                    var pSquared = (long)p * p;
                    do
                    {
                        products[kk] *= p;
                        var quotient = (k0 + kk) / pSquared;
                        int exponent;
                        for (exponent = 2; quotient % p == 0; exponent++)
                        {
                            products[kk] *= p;
                            quotient /= p;
                        }
                        values[kk + koffset] = (ushort)(values[kk + koffset] / 2 * (exponent + 1));
                        kk += pSquared;
                    }
                    while (kk < length);
                }
                offsetsPower[i] = kk - length;
            }
        }

        private ulong FinishBlock(long k0, int length, long[] products, ushort[] values, long kmin, ulong[] sums, long smin, ulong sum0, bool onlySums)
        {
            // Each product can have at most one more prime factor.
            // It has that factor if the value of the product is
            // less than the full value.
            var deltai = (int)(k0 - kmin);
            var deltas = (int)(smin - kmin);
            var kmax = (int)(deltai + length);
            if (onlySums)
            {
                for (var k = 0; k < kmax; k++)
                {
                    sums[k - deltas] = sum0 += (uint)(values[k] << -(int)((products[k] - (k + kmin)) >> 63));
                    Debug.Assert(k == 0 || (uint)IntegerMath.NumberOfDivisors(k + kmin) == sums[k - deltas] - sums[k - deltas - 1]);
                }
            }
            else if (sums == null)
            {
                for (var k = deltai; k < kmax; k++)
                {
                    sum0 += values[k] <<= -(int)((products[k - deltai] - (k + kmin)) >> 63);
                    Debug.Assert(IntegerMath.NumberOfDivisors(k + kmin) == values[k]);
                }
            }
            else
            {
                for (var k = deltai; k < kmax; k++)
                {
                    sums[k - deltas] = sum0 += values[k] <<= -(int)((products[k - deltai] - (k + kmin)) >> 63);
                    Debug.Assert(IntegerMath.NumberOfDivisors(k + kmin) == values[k]);
                }
            }
            return sum0;
        }
    }
}
