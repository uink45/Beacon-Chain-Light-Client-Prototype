using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Collections;

namespace Nethermind.Decompose.Numerics
{
    public class MobiusCollection : IEnumerable<int>
    {
        private struct Offsets
        {
            public int Offset;
            public int OffsetSquared;
        }

        private const int blockSize = 1 << 15;

        private uint[] primes;
        private int size;
        private sbyte[] values;
        private int cycleLimit;
        private int cycleSize;
        private int[] cycle;

        public int Size { get { return size; } }
        public int this[int index] { get { return values[index]; } }

        public MobiusCollection(int size, int threads)
        {
            this.size = size;
            var limit = (int)Math.Ceiling(Math.Sqrt(size));
            primes = new PrimeCollection(limit, 0).ToArray();
            values = new sbyte[size];
            if (primes.Length == 0)
            {
                if (size > 2)
                    values[2] = -1;
                if (size > 3)
                    values[3] = -1;
            }
            else
            {
                CreateCycle();
                GetValues(threads);
            }
            values[1] = 1;
        }

        private void CreateCycle()
        {
            // Create pre-sieved cycle of the squares of small primes.
            var dmax = 4;
            cycleLimit = Math.Min(primes.Length, dmax);
            cycleSize = 1;
            for (var i = 0; i < cycleLimit; i++)
            {
                var p = (int)primes[i];
                cycleSize *= p * p;
            }
            cycle = new int[cycleSize];
            for (var i = 0; i < cycleSize; i++)
                cycle[i] = 1;
            for (var i = 0; i < cycleLimit; i++)
            {
                var p = (int)primes[i];
                var pMinus = -p;
                for (var k = 0; k < cycleSize; k += p)
                    cycle[k] *= pMinus;
                var pSquared = p * p;
                for (var k = 0; k < cycleSize; k += pSquared)
                    cycle[k] = 0;
            }
        }

        private void GetValues(int threads)
        {
            if (threads == 0)
            {
                ProcessRange(1, size);
                return;
            }
            var tasks = new Task[threads];
            var batchSize = ((size + threads - 1) / threads + 1) & ~1;
            for (var thread = 0; thread < threads; thread++)
            {
                var kstart = thread * batchSize + 1;
                var kend = Math.Min(kstart + batchSize, size);
                tasks[thread] = Task.Factory.StartNew(() => ProcessRange(kstart, kend));
            }
            Task.WaitAll(tasks);
        }

        private void ProcessRange(int kstart, int kend)
        {
            var products = new int[blockSize];
            var offsets = new Offsets[primes.Length];
            var cycleOffset = cycleSize - kstart % cycleSize;
            if (cycleOffset == cycleSize)
                cycleOffset = 0;
            offsets[0].Offset = cycleOffset;
            for (var i = 1; i < primes.Length; i++)
            {
                var p = (int)primes[i];
                var offset = p - kstart % p;
                if (offset == p)
                    offset = 0;
                offsets[i].Offset = offset;
                var pSquared = p * p;
                var offsetSquared = pSquared - kstart % pSquared;
                if (offsetSquared == pSquared)
                    offsetSquared = 0;
                offsets[i].OffsetSquared = offsetSquared;
            }
            for (var k = kstart; k < kend; k += blockSize)
            {
                var length = (int)Math.Min(blockSize, kend - k);
                SieveBlock(k, length, products, offsets);
                FinishBlock(k, length, products);
            }
        }

        private void SieveBlock(int k0, int length, int[] products, Offsets[] offsets)
        {
            var cycleOffset = offsets[0].Offset;
            Array.Copy(cycle, cycleSize - cycleOffset, products, 0, Math.Min(length, cycleOffset));
            while (cycleOffset < length)
            {
                Array.Copy(cycle, 0, products, cycleOffset, Math.Min(cycleSize, length - cycleOffset));
                cycleOffset += cycleSize;
            }
            offsets[0].Offset = cycleOffset - length;

            for (var i = cycleLimit; i < primes.Length; i++)
            {
                var p = (int)primes[i];
                var pMinus = -p;
                int k;
                for (k = offsets[i].Offset; k < length; k += p)
                    products[k] *= pMinus;
                offsets[i].Offset = k - length;
                var pSquared = p * p;
                for (k = offsets[i].OffsetSquared; k < length; k += pSquared)
                    products[k] = 0;
                offsets[i].OffsetSquared = k - length;
            }
        }

        private void FinishBlock(int k0, int length, int[] products)
        {
            // Each product that is square-free can have at most one more
            // prime factor.  It has that factor if the absolute value of
            // the product is less than the full value.
            for (int i = 0, k = k0; i < length; i++, k++)
            {
                // Look ma, no branching.
                var p = products[i];
                var pos = -p >> 31; // pos = -1 if p > 0, zero otherwise
                var neg = p >> 31; // neg = -1 if p is < 0, zero otherwise
                var abs = (p + neg) ^ neg; // abs = |p|
                var flip = (abs - k) >> 31; // flip = -1 if abs < k, zero otherwise
                values[k] = (sbyte)(((neg - pos) ^ flip) - flip); // values[k] = pos - neg if flip = -1, neg - pos otherwise
                Debug.Assert(values[k] == Math.Sign(p) * (Math.Abs(p) != k ? -1 : 1));
            }
        }

        public IEnumerator<int> GetEnumerator()
        {
            return values.Select(value => (int)value).GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
