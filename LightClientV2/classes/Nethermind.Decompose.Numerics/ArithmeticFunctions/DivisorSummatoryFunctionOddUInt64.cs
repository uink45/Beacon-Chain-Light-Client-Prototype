#undef RECORD_SIZES
#undef DIAG

using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;
using Nethermind.Dirichlet.Numerics;
using System.Collections.Generic;

namespace Nethermind.Decompose.Numerics
{
    public class DivisorSummatoryFunctionOddUInt64 : IDivisorSummatoryFunction<BigInteger>, IDivisorSummatoryFunction<ulong>
    {
        private struct Region
        {
            public Region(ulong w, ulong h, ulong a1, ulong b1, ulong c1, ulong a2, ulong b2, ulong c2)
            {
                this.w = w;
                this.h = h;
                this.a1 = a1;
                this.b1 = b1;
                this.c1 = c1;
                this.a2 = a2;
                this.b2 = b2;
                this.c2 = c2;
            }

            public ulong w;
            public ulong h;
            public ulong a1;
            public ulong b1;
            public ulong c1;
            public ulong a2;
            public ulong b2;
            public ulong c2;
        }

        private const long nMaxSimple = (long)1 << 32;
        private static readonly ulong C1 = 20;
        private static readonly ulong C2 = 25;

        private int threads;
        private bool mod2;
        private ulong n;
        private ulong sum;
        private int unprocessed;
        private ulong xmanual;
        private ManualResetEventSlim finished;
        private Stack<Region> stack;
        private BlockingCollection<Region> queue;
        private DivisionFreeDivisorSummatoryFunction manualAlgorithm;

#if RECORD_SIZES
        private ulong amax;
        private ulong bmax;
        private ulong cmax;
#endif

        public DivisorSummatoryFunctionOddUInt64(int threads, bool mod2)
        {
            this.threads = threads;
            this.mod2 = mod2;
            finished = new ManualResetEventSlim();
            manualAlgorithm = new DivisionFreeDivisorSummatoryFunction(threads, false, true, mod2);
        }

        public BigInteger Evaluate(BigInteger n)
        {
            return Evaluate((ulong)n);
        }

        public ulong Evaluate(ulong n)
        {
            var xmax = IntegerMath.FloorSquareRoot(n);
            var s = Evaluate(n, 1, xmax);
            var xmax2 = T1(xmax);
            return 2 * s - (ulong)xmax2 * (ulong)xmax2;
        }

        public BigInteger Evaluate(BigInteger n, BigInteger x0, BigInteger xmax)
        {
            return Evaluate((ulong)n, (ulong)x0, (ulong)xmax);
        }

        public ulong Evaluate(ulong n, ulong x0, ulong xmax)
        {
            if (x0 > xmax)
                return 0;

            if (n <= nMaxSimple)
                return (ulong)manualAlgorithm.Evaluate(n, x0, xmax);

            if (threads == 0)
                stack = new Stack<Region>();
            else
                queue = new BlockingCollection<Region>();
            sum = 0;
#if RECORD_SIZES
            amax = 0;
            bmax = 0;
            cmax = 0;
#endif

            if (threads == 0)
            {
                AddToSum(EvaluateInternal(n, x0, xmax));
                if (xmanual > 1)
                    AddToSum((ulong)manualAlgorithm.Evaluate(n, x0, 2 * xmanual - 3));
                return sum;
            }

            // Create consumers.
            var consumers = threads;
            var tasks = new Task[consumers];
            for (var consumer = 0; consumer < consumers; consumer++)
            {
                var thread = consumer;
                tasks[consumer] = Task.Factory.StartNew(() => ConsumeRegions(thread));
            }

            // Produce work items.
            unprocessed = 1;
            finished.Reset();
            AddToSum(Processed(EvaluateInternal(n, x0, xmax)));
            finished.Wait();
            queue.CompleteAdding();

            // Add manual portion.
            if (xmanual > 1)
                AddToSum((ulong)manualAlgorithm.Evaluate(n, x0, 2 * xmanual - 3));

            // Wait for completion.
            Task.WaitAll(tasks);

#if RECORD_SIZES
            Console.WriteLine("amax = {0}, bmax = {1}, cmax = {2}", amax, bmax, cmax);
#endif
            return sum;
        }

        public void ConsumeRegions(int thread)
        {
            var s = (ulong)0;
            Region r;
            try
            {
                while (queue.TryTake(out r, Timeout.Infinite))
                    s += ProcessRegion(thread, r.w, r.h, r.a1, r.b1, r.c1, r.a2, r.b2, r.c2);
            }
            catch (OperationCanceledException)
            {
            }
            catch
            {
                finished.Set();
                throw;
            }
            AddToSum(s);
        }

        private void Enqueue(Region r)
        {
            if (threads == 0)
            {
                ++unprocessed;
                stack.Push(r);
            }
            else
            {
                Interlocked.Add(ref unprocessed, 1);
                queue.Add(r);
            }
        }

        private ulong Processed(ulong result)
        {
            var value = Interlocked.Add(ref unprocessed, -1);
            if (value == 0)
                finished.Set();
            return result;
        }

        private ulong EvaluateInternal(ulong n, ulong x0, ulong xmax)
        {
            this.n = n;
            x0 = T1(x0 + 1);
            xmax = T1(xmax);
            if (x0 > xmax)
                return 0;
            var ymin = YFloor(xmax);
            var xmin = Math.Max(x0, Math.Min(T1(C1 * IntegerMath.CeilingRoot(2 * n, 3)), xmax));
#if DIAG
            Console.WriteLine("n = {0}, xmin = {1}, xmax = {2}", n, xmin, xmax);
#endif
            var s = (ulong)0;
            var a2 = (ulong)1;
            var x2 = xmax;
            var y2 = ymin;
            var c2 = a2 * x2 + y2;
            while (true)
            {
                var a1 = a2 + 1;
                var x4 = YTan(a1);
                var y4 = YFloor(x4);
                var c4 = a1 * x4 + y4;
                var x5 = x4 + 1;
                var y5 = YFloor(x5);
                var c5 = a1 * x5 + y5;
                if (x4 <= xmin)
                    break;
                s += Triangle(c4 - c2 - x0) - Triangle(c4 - c2 - x5) + Triangle(c5 - c2 - x5);
                if (threads == 0)
                {
                    s += ProcessRegion(0, (ulong)(a1 * x2 + y2 - c5), (ulong)(a2 * x5 + y5 - c2), a1, 1, c5, a2, 1, c2);
                    while (stack.Count > 0)
                    {
                        var r = stack.Pop();
                        s += ProcessRegion(0, r.w, r.h, r.a1, r.b1, r.c1, r.a2, r.b2, r.c2);
                    }
                }
                else
                    Enqueue(new Region((ulong)(a1 * x2 + y2 - c5), (ulong)(a2 * x5 + y5 - c2), a1, 1, c5, a2, 1, c2));
                a2 = a1;
                x2 = x4;
                y2 = y4;
                c2 = c4;
            }
            s += (xmax - x0 + 1) * ymin + Triangle(xmax - x0);
            var rest = x2 - x0;
            s -= y2 * rest + a2 * Triangle(rest);
            xmanual = x2;
            return s;
        }

        public ulong ProcessRegion(int thread, ulong w, ulong h, ulong a1, ulong b1, ulong c1, ulong a2, ulong b2, ulong c2)
        {
#if DIAG
            Console.WriteLine("ProcessRegion: w = {0}, h = {1}, a1/b1 = {2}/{3}, a2/b2 = {4}/{5}, c1 = {6}, c2 = {7}", w, h, a1, b1, a2, b2, c1, c2);
#endif
#if RECORD_SIZES
            amax = Math.Max(Math.Max(amax, a1), a2);
            bmax = Math.Max(Math.Max(bmax, b1), b2);
            cmax = Math.Max(Math.Max(bmax, c1), c2);
#endif
            var s = (ulong)0;
            while (true)
            {
                if (h > 0 && H(w, 1, a1, b1, c1, a2, b2, c2) <= n)
                {
                    s += w;
                    ++c2;
                    --h;
                }
                Debug.Assert(h == 0 || H(w, 0, a1, b1, c1, a2, b2, c2) <= n && H(w, 1, a1, b1, c1, a2, b2, c2) > n);
                if (w > 0 && H(1, h, a1, b1, c1, a2, b2, c2) <= n)
                {
                    s += h;
                    ++c1;
                    --w;
                }
                Debug.Assert(w == 0 || H(0, h, a1, b1, c1, a2, b2, c2) <= n && H(1, h, a1, b1, c1, a2, b2, c2) > n);
                var a3 = a1 + a2;
                var b3 = b1 + b2;
                var ab1 = a1 + b1;
                var a3b3 = a3 * b3;
                var abba = a1 * b2 + b1 * a2;
                var ab2 = 2 * a1 * b1;
                var u4 = UTan(ab1, abba, ab2, a3b3, c1);
                if (u4 <= 0 || u4 > int.MaxValue)
                    return Processed(s + ProcessRegionManual(thread, w, h, a1, b1, c1, a2, b2, c2));
                var u5 = u4 + 1;
                ulong v4, v5;
                VFloor2(u4, a1, b1, c1, c2, abba, ab2, out v4, out v5);
                Debug.Assert(v4 == VFloor(u4, a1, b1, c1, a2, b2, c2));
                Debug.Assert(v5 == VFloor(u5, a1, b1, c1, a2, b2, c2));
                Debug.Assert(H(u4, v4, a1, b1, c1, a2, b2, c2) <= n && H(u4, v4 + 1, a1, b1, c1, a2, b2, c2) > n);
                Debug.Assert(H(u5, v5, a1, b1, c1, a2, b2, c2) <= n && H(u5, v5 + 1, a1, b1, c1, a2, b2, c2) > n);
                var v6 = u4 + v4;
                var u7 = u5 + v5;
                if (u4 <= C2 || v5 <= C2 || v6 >= h || u7 >= w)
                    return Processed(s + ProcessRegionManual(thread, w, h, a1, b1, c1, a2, b2, c2));
                if (v6 != u7)
                    s += Triangle(v6 - 1) - Triangle(v6 - u5) + Triangle(u7 - u5);
                else
                    s += Triangle(v6 - 1);
#if DIAG
                Console.WriteLine("ProcessRegion: s = {0}", s);
#endif
                Enqueue(new Region(u4, h - v6, a1, b1, c1, a3, b3, c1 + c2 + v6));
                w -= u7;
                h = v5;
                a1 = a3;
                b1 = b3;
                c1 += c2 + u7;
            }
        }

        public ulong ProcessRegionManual(int thread, ulong w, ulong h, ulong a1, ulong b1, ulong c1, ulong a2, ulong b2, ulong c2)
        {
            return w < h ? ProcessRegionManual(thread, w, a1, b1, c1, a2, b2, c2) : ProcessRegionManual(thread, h, b2, a2, c2, b1, a1, c1);
        }

        public ulong ProcessRegionManual(int thread, ulong w, ulong a1, ulong b1, ulong c1, ulong a2, ulong b2, ulong c2)
        {
            if (w <= 1)
                return 0;

            var s = (ulong)0;
            var umax = w - 1;
            var t1 = (a1 * b2 + b1 * a2) << 1;
            var t2 = (c1 << 1) - a1 - b1;
            var t3 = (t2 << 2) + 12;
            var t4 = (a1 * b1) << 2;
            var t5 = t1 * (1 + c1) - a1 + b1 - t4 * c2;
            var t6 = IntegerMath.Square(t2 + 2) - t4 * n;
            Debug.Assert(t6 == UInt128.Square(t2 + 2) - t4 * (UInt128)n);

            var u = (ulong)1;
            while (true)
            {
                Debug.Assert((t5 - IntegerMath.CeilingSquareRoot(t6)) / t4 == VFloor(u, a1, b1, c1, a2, b2, c2));
                s += (t5 - IntegerMath.CeilingSquareRoot(t6)) / t4;
                if (u >= umax)
                    break;
                t5 += t1;
                t6 += t3;
                t3 += 8;
                ++u;
            }

            Debug.Assert(s == ProcessRegionHorizontal(w, 0, a1, b1, c1, a2, b2, c2));
#if DIAG
            Console.WriteLine("ProcessRegionManual: s = {0}", s);
#endif
            return s;
        }

        public ulong ProcessRegionHorizontal(ulong w, ulong h, ulong a1, ulong b1, ulong c1, ulong a2, ulong b2, ulong c2)
        {
            var s = (ulong)0;
            for (var u = (ulong)1; u < w; u++)
                s += VFloor(u, a1, b1, c1, a2, b2, c2);
            return s;
        }

        public ulong ProcessRegionVertical(ulong w, ulong h, ulong a1, ulong b1, ulong c1, ulong a2, ulong b2, ulong c2)
        {
            var s = (ulong)0;
            for (var v = (ulong)1; v < h; v++)
                s += UFloor(v, a1, b1, c1, a2, b2, c2);
            return s;
        }

        public ulong H(ulong u, ulong v, ulong a1, ulong b1, ulong c1, ulong a2, ulong b2, ulong c2)
        {
            var uu = u + c1;
            var vv = v + c2;
            return (((b2 * uu - b1 * vv) << 1) - 1) * (((a1 * vv - a2 * uu) << 1) - 1);
        }

        public ulong UTan(ulong ab1, ulong abba, ulong ab2, ulong a3b3, ulong c1)
        {
            return (ulong)((ab1 + UInt128.FloorSqrt(UInt128.Square(abba + ab2) * n / a3b3) - (c1 << 1)) / 2);
        }

        public ulong UFloor(ulong v, ulong a1, ulong b1, ulong c1, ulong a2, ulong b2, ulong c2)
        {
            return (ulong)((2 * (a1 * b2 + b1 * a2) * (v + c2) + a2 - b2 - UInt128.CeilingSqrt(UInt128.Square(2 * (v + c2) - a2 - b2) - 4 * a2 * b2 * (UInt128)n)) / (4 * a2 * b2) - c1);
        }

        public ulong VFloor(ulong u, ulong a1, ulong b1, ulong c1, ulong a2, ulong b2, ulong c2)
        {
            return (ulong)((2 * (a1 * b2 + b1 * a2) * (u + c1) - a1 + b1 - UInt128.CeilingSqrt(UInt128.Square(2 * (u + c1) - a1 - b1) - 4 * a1 * b1 * (UInt128)n)) / (4 * a1 * b1) - c2);
        }

        public void VFloor2(ulong u1, ulong a1, ulong b1, ulong c1, ulong c2, ulong abba, ulong ab2, out ulong v1, out ulong v2)
        {
            var uu = (u1 + c1) << 1;
            var t1 = ab2 << 1;
            var t2 = abba * uu - a1 + b1 - t1 * c2;
            var t3 = uu - a1 - b1;
            var t4 = UInt128.Square(t3) - t1 * (UInt128)n;
            v1 = (ulong)((t2 - UInt128.CeilingSqrt(t4)) / t1);
            v2 = (ulong)((t2 + (abba << 1) - UInt128.CeilingSqrt((t4 + ((t3 + 1) << 2)))) / t1);
        }

        public static ulong Triangle(ulong a)
        {
            return a * (a + 1) >> 1;
        }

        private ulong T1(ulong x)
        {
            return (x + 1) >> 1;
        }

        private ulong YTan(ulong a)
        {
            return T1(IntegerMath.FloorSquareRoot((n / a)));
        }

        private ulong YFloor(ulong x)
        {
            return (n / ((x << 1) - 1) + 1) >> 1;
        }

        private void AddToSum(ulong s)
        {
            lock (this)
                sum += s;
        }
    }
}
