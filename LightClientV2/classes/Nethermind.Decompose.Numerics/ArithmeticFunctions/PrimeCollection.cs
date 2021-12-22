using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Nethermind.Decompose.Numerics
{
    [DebuggerDisplay("Count = {Count}")]
    public class PrimeCollection : IEnumerable<uint>
    {
        [DebuggerDisplay("Count = {Count}")]
        private class Primes : IEnumerable<uint>
        {
            private const int bucketSize = 1 << 20;

            private List<uint[]> primes;
            private uint[] currentBucket;
            private int fullBuckets;
            private int currentOffset;

            public int Count
            {
                get { return fullBuckets * bucketSize + currentOffset; }
                set { IncreaseCount(value - Count); }
            }

            public uint[] FirstBucket { get { return primes[0]; } }

            public uint this[int index]
            {
                get { return primes[index / bucketSize][index % bucketSize]; }
            }

            public Primes()
            {
                fullBuckets = 0;
                currentOffset = 0;
                primes = new List<uint[]>();
                currentBucket = new uint[bucketSize];
                primes.Add(currentBucket);
            }

            public void AddPrime(uint p)
            {
                currentBucket[currentOffset++] = p;
                if (currentOffset == bucketSize)
                    AddBucket();
            }

            public void AddPrimes(uint k0, int length, bool[] block)
            {
                var k1 = k0 + 1;
                var length2 = length >> 1;
                var imin = 3 - k0 % 3;
                imin = (imin + (((imin & 1) - 1) & 3)) >> 1;
                var imax = length2 - (length2 - imin) % 3;
                if (0 < imin && !block[0])
                    AddPrime((uint)(0 << 1) + k1);
                if (1 < imin && !block[1])
                    AddPrime((uint)(1 << 1) + k1);
                var i = imin + 1;
                while (i < imax)
                {
                    if (!block[i])
                        AddPrime((uint)(i << 1) + k1);
                    if (!block[i + 1])
                        AddPrime((uint)((i + 1) << 1) + k1);
                    i += 3;
                }
                if (i < length2 && !block[i])
                    AddPrime((uint)(i << 1) + k1);
            }

            public void AddPrimes(Primes other, int startIndex)
            {
                var bucketIndex = startIndex / bucketSize;
                var bucketOffset = startIndex % bucketSize;
                for (int otherBucketIndex = 0; otherBucketIndex <= other.fullBuckets; otherBucketIndex++)
                {
                    var bucket = other.primes[otherBucketIndex];
                    var size = otherBucketIndex != other.fullBuckets ? bucketSize : other.currentOffset;
                    var size1 = Math.Min(size, bucketSize - bucketOffset);
                    var size2 = size - size1;
                    Array.Copy(bucket, 0, primes[bucketIndex], bucketOffset, size1);
                    bucketOffset += size1;
                    if (bucketOffset == bucketSize)
                    {
                        ++bucketIndex;
                        bucketOffset = 0;
                        Array.Copy(bucket, size1, primes[bucketIndex], 0, size2);
                        bucketOffset += size2;
                    }
                }
            }

            private void IncreaseCount(int increment)
            {
                if (increment < bucketSize - currentOffset)
                {
                    currentOffset += increment;
                    return;
                }
                increment -= bucketSize - currentOffset;
                AddBucket();
                while (increment >= bucketSize)
                {
                    AddBucket();
                    increment -= bucketSize;
                }
                currentOffset = increment;
            }

            private void AddBucket()
            {
                ++fullBuckets;
                currentBucket = new uint[bucketSize];
                primes.Add(currentBucket);
                currentOffset = 0;
            }

            public IEnumerator<uint> GetEnumerator()
            {
                for (int bucketIndex = 0; bucketIndex < fullBuckets; bucketIndex++)
                {
                    var bucket = primes[bucketIndex];
                    for (int i = 0; i < bucketSize; i++)
                        yield return bucket[i];
                }
                {
                    var bucket = primes[fullBuckets];
                    for (int i = 0; i < currentOffset; i++)
                        yield return bucket[i];
                }
            }

            IEnumerator IEnumerable.GetEnumerator()
            {
                return GetEnumerator();
            }
        }

        private const int blockSizeSingleThreaded = 1 << 16;
        private const int blockSizeMultiThreaded = 1 << 16;

        private long size;
        private int limit;
        private bool[] block;
        private Primes primes;
        private uint[] divisors;
        private bool[] cycle;
        private int dlimit;
        private int cycleSize;
        private int numberOfDivisors;

        public long Size { get { return size; } }
        public int Count { get { return primes.Count; } }

        public uint this[int index]
        {
            get { return primes[index]; }
        }

        public PrimeCollection(long size, int threads)
        {
            this.size = Math.Min((long)uint.MaxValue + 1, size);
            limit = (int)Math.Ceiling(Math.Sqrt(size));
            block = new bool[Math.Max(blockSizeSingleThreaded >> 1, limit)];
            primes = new Primes();
            if (size <= 13)
            {
                // Special case for small collections because we handle
                // 2 and 3 differently.
                foreach (var prime in new uint[] { 2, 3, 5, 7, 11 })
                {
                    if (size > prime)
                        primes.AddPrime(prime);
                }
            }
            else
            {
                GetDivisors(block);
                CreateCycle();
                GetPrimes(threads);
            }
        }

        public IEnumerator<uint> GetEnumerator()
        {
            return primes.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        private void GetDivisors(bool[] block)
        {
            // Sieve for all primes < sqrt(size).
            var sublimit = (int)Math.Ceiling(Math.Sqrt(limit));
            primes.AddPrime(2);
            for (var i = 3; i < sublimit; i += 2)
            {
                if (!block[i])
                {
                    for (var j = i * i; j < limit; j += i)
                        block[j] = true;
                    primes.AddPrime((uint)i);
                }
            }
            for (var i = sublimit | 1; i < limit; i += 2)
            {
                if (!block[i])
                    primes.AddPrime((uint)i);
            }
            divisors = primes.FirstBucket;
            numberOfDivisors = primes.Count;
        }

        private void CreateCycle()
        {
            // Create pre-sieved cycle of small primes.
            var dmin = 2;
            var dmax = 6;
            dlimit = Math.Min(numberOfDivisors, dmax);
            cycleSize = 1;
            for (var d = dmin; d < dlimit; d++)
                cycleSize *= (int)divisors[d];
            cycle = new bool[cycleSize];
            for (var d = dmin; d < dlimit; d++)
            {
                var i = (int)divisors[d];
                for (var j = 0; j < cycleSize; j += i)
                    cycle[j] = true;
            }
        }

        private void GetPrimes(int threads)
        {
            // Process all values between sqrt(size) and size.
            var k0 = (long)limit & ~1;
            if (threads == 0)
            {
                ProcessRange(primes, block, k0, size, blockSizeSingleThreaded);
                return;
            }
            var tasks = new Task[threads];
            var batchSize = ((size - k0 + threads - 1) / threads + 1) & ~1;
            var morePrimes = new List<Primes>();
            for (var thread = 0; thread < threads; thread++)
            {
                var taskPrimes = thread == 0 ? primes : new Primes();
                if (thread != 0)
                    morePrimes.Add(taskPrimes);
                var taskBlock = thread == 0 ? block : new bool[blockSizeMultiThreaded >> 1];
                var kstart = k0 + thread * batchSize;
                var kend = Math.Min(kstart + batchSize, size);
                tasks[thread] = Task.Factory.StartNew(() =>
                    ProcessRange(taskPrimes, taskBlock, kstart, kend, blockSizeMultiThreaded));
            }
            Task.WaitAll(tasks);
            ConsolidatePrimes(morePrimes);
        }

        private void ConsolidatePrimes(List<Primes> morePrimes)
        {
            var threads = morePrimes.Count;
            var tasks = new Task[threads];
            var count = primes.Count;
            primes.Count = count + morePrimes.Sum(item => item.Count);
            for (var thread = 0; thread < threads; thread++)
            {
                var taskPrimes = morePrimes[thread];
                var start = count;
                tasks[thread] = Task.Factory.StartNew(() =>
                    primes.AddPrimes(taskPrimes, start));
                count += taskPrimes.Count;
            }
            Task.WaitAll(tasks);
        }

        private void ProcessRange(Primes primes, bool[] block, long kstart, long kend, int blockSize)
        {
            var offsets = new int[numberOfDivisors];

            var cycleOffset = cycleSize - (int)(kstart % cycleSize);
            cycleOffset = (cycleOffset + (((cycleOffset & 1) - 1) & cycleSize)) >> 1;
            offsets[0] = cycleOffset;

            for (var i = 1; i < numberOfDivisors; i++)
            {
                var d = divisors[i];
                var offset = d - (uint)(kstart % d);
                offset = (offset + (((offset & 1) - 1) & d)) >> 1;
                offsets[i] = (int)offset;
            }

            for (var k = kstart; k < kend; k += blockSize)
            {
                var length = (int)Math.Min(blockSize, kend - k);
                SieveBlock((uint)k, length, block, offsets);
                primes.AddPrimes((uint)k, length, block);
            }
        }

        private void SieveBlock(uint k0, int length, bool []block, int[] offsets)
        {
            var length2 = length >> 1;

            var cycleOffset = offsets[0];
            Array.Copy(cycle, cycleSize - cycleOffset, block, 0, cycleOffset);
            while (cycleOffset < length2)
            {
                Array.Copy(cycle, 0, block, cycleOffset, Math.Min(cycleSize, length2 - cycleOffset));
                cycleOffset += cycleSize;
            }
            offsets[0] = cycleOffset - length2;

            for (var d = dlimit; d < numberOfDivisors; d++)
            {
                var i = (int)divisors[d];
                var j = offsets[d];
                while (j < length2)
                {
                    block[j] = true;
                    j += i;
                }
                offsets[d] = j - length2;
            }
        }
    }
}
