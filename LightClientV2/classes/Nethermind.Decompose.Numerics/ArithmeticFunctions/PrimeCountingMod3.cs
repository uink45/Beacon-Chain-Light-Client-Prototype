using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Numerics;
using System.Threading.Tasks;

namespace Nethermind.Decompose.Numerics
{
    public class PrimeCountingMod3
    {
        private int threads;
        private MobiusCollection mobius;
        private Dictionary<BigInteger, BigInteger> t3Map;
        private DivisionFreeDivisorSummatoryFunction[] hyperbolicSum;

        public PrimeCountingMod3(int threads)
        {
            this.threads = threads;
            t3Map = new Dictionary<BigInteger, BigInteger>();
            var count = Math.Max(threads, 1);
            hyperbolicSum = new DivisionFreeDivisorSummatoryFunction[count];
            for (var i = 0; i < count; i++)
                hyperbolicSum[i] = new DivisionFreeDivisorSummatoryFunction(0, false, false);
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
            return sum % 3;
        }

        public BigInteger F3(BigInteger n)
        {
            //Console.WriteLine("F3({0})", n);
            var s = (BigInteger)0;
            var dmax = IntegerMath.FloorRoot(n, 3);
            for (var d = 1; d <= dmax; d++)
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
            return t3Map[n] = T3Slow(n);
        }

        public BigInteger T3Slow(BigInteger n)
        {
            //Console.WriteLine("T3({0})", n);
            var sum = (BigInteger)0;
            var root3 = IntegerMath.FloorRoot(n, 3);
            if (threads == 0)
            {
                for (var z = (BigInteger)1; z <= root3; z++)
                {
                    var nz = n / z;
                    var sqrtnz = IntegerMath.FloorSquareRoot(nz);
                    var t = hyperbolicSum[0].Evaluate(nz, (long)z + 1, (long)sqrtnz);
                    sum += 2 * t - sqrtnz * sqrtnz + nz / z;
                }
            }
            else
            {
                var tasks = new Task[threads];
                for (var i = 0; i < threads; i++)
                {
                    var thread = i;
                    tasks[i] = new Task(() =>
                        {
                            var s = (BigInteger)0;
                            for (var z = (BigInteger)1 + thread; z <= root3; z += threads)
                            {
                                var nz = n / z;
                                var sqrtnz = IntegerMath.FloorSquareRoot(nz);
                                var t = hyperbolicSum[thread].Evaluate(nz, (long)z + 1, (long)sqrtnz);
                                s += 2 * t - sqrtnz * sqrtnz + nz / z;
                            }
                            lock (this)
                            {
                                sum += s;
                            }
                        });
                    tasks[i].Start();
                }
                Task.WaitAll(tasks);
            }
            sum = 3 * sum + root3 * root3 * root3;
            return sum;
        }
    }
}
