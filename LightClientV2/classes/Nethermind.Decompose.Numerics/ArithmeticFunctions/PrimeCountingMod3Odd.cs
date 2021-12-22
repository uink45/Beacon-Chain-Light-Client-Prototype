using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Numerics;
using System.Threading.Tasks;

namespace Nethermind.Decompose.Numerics
{
    public class PrimeCountingMod3Odd
    {
        private int threads;
        private bool simple;
        private MobiusCollection mobius;
        private Dictionary<BigInteger, BigInteger> t3Map;
        private IDivisorSummatoryFunction<BigInteger> [] hyperbolicSum;

        public PrimeCountingMod3Odd(int threads, bool simple)
        {
            this.threads = threads;
            this.simple = simple;
            t3Map = new Dictionary<BigInteger, BigInteger>();
            var count = Math.Max(threads, 1);
            hyperbolicSum = new IDivisorSummatoryFunction<BigInteger>[count];
            for (var i = 0; i < count; i++)
            {
                if (simple)
                    hyperbolicSum[i] = new DivisionFreeDivisorSummatoryFunction(0, false, true);
                else
                    hyperbolicSum[i] = new DivisorSummatoryFunctionOdd(0, false);
            }
        }

        public BigInteger Evaluate(BigInteger n)
        {
            t3Map.Clear();
            var jmax = IntegerMath.FloorLog(n, 2);
            var dmax = IntegerMath.FloorRoot(n, 3);
            mobius = new MobiusCollection((int)(IntegerMath.Max(jmax, dmax) + 1), 0);
            return Pi3(n);
        }

        public BigInteger Pi3(BigInteger n)
        {
            var kmax = IntegerMath.FloorLog(n, 2);
            var sum = (BigInteger)0;
            for (var k = 1; k <= kmax; k++)
            {
                if (k % 3 != 0 && mobius[k] != 0)
                    sum += k * mobius[k] * F3(IntegerMath.FloorRoot(n, k));
            }
            return (sum + 1) % 3;
        }

        public BigInteger F3(BigInteger n)
        {
            //Console.WriteLine("F3({0})", n);
            var s = (BigInteger)0;
            var dmax = IntegerMath.FloorRoot(n, 3);
            for (var d = 1; d <= dmax; d += 2)
            {
                var md = mobius[d];
                if (md == 0)
                    continue;
                var term = T3(n / IntegerMath.Power((BigInteger)d, 3));
                s += md * term;
            }
            Debug.Assert((s - 1) % 3 == 0);
            return (s - 1) / 3;
        }

        public BigInteger T3(BigInteger n)
        {
            BigInteger value;
            if (t3Map.TryGetValue(n, out value))
                return value;
#if true
            var result = t3Map[n] = T3Slow(n);
#else
            Console.WriteLine("T3({0})", n);
            var timer = new Stopwatch();
            timer.Restart();
            var result = t3Map[n] = T3Slow(n);
            Console.WriteLine("elapsed = {0:F3} msec", (double)timer.ElapsedTicks / Stopwatch.Frequency * 1000);
#endif
            return result;
        }

        public BigInteger T3Slow(BigInteger n)
        {
            var sum = (BigInteger)0;
            var root3 = IntegerMath.FloorRoot(n, 3);
            if (threads == 0)
                sum += T3Worker(n, root3, 0, 1);
            else
            {
                var tasks = new Task[threads];
                for (var i = 0; i < threads; i++)
                {
                    var thread = i;
                    tasks[i] = new Task(() =>
                    {
                        var s = T3Worker(n, root3, thread, threads);
                        lock (this)
                            sum += s;
                    });
                    tasks[i].Start();
                }
                Task.WaitAll(tasks);
            }
            return 3 * sum + IntegerMath.Power(T1(root3), 3);
        }

        private BigInteger T3Worker(BigInteger n, BigInteger root3, int worker, int workers)
        {
            var s = (BigInteger)0;
            for (var z = (BigInteger)1 + 2 * worker; z <= root3; z += 2 * workers)
            {
                var nz = n / z;
                var sqrtnz = IntegerMath.FloorSquareRoot(nz);
                var t = hyperbolicSum[worker].Evaluate(nz, (long)z + 2, (long)sqrtnz);
                s += 2 * t - IntegerMath.Power(T1(sqrtnz), 2) + T1(nz / z);
            }
            return s;
        }

        private static BigInteger T1(BigInteger n)
        {
            return (n + 1) / 2;
        }
    }
}
