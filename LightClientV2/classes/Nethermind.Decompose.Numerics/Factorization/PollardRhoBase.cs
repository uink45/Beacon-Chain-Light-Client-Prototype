using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;

namespace Nethermind.Decompose.Numerics
{
    public abstract class PollardRhoBase : IFactorizationAlgorithm<BigInteger>
    {
        protected IRandomNumberAlgorithm<BigInteger> random = new MersenneTwister(0).Create<BigInteger>();
        protected int threads;
        protected int iterations;

        protected PollardRhoBase(int threads, int iterations)
        {
            this.threads = threads;
            this.iterations = iterations != 0 ? iterations: int.MaxValue;
        }

        public IEnumerable<BigInteger> Factor(BigInteger n)
        {
            if (n.IsOne)
            {
                yield return BigInteger.One;
                yield break;
            }
            while (!IntegerMath.IsPrime(n))
            {
                var divisor = GetDivisor(n);
                while (divisor.IsZero)
                    divisor = GetDivisor(n);
                if (divisor.IsOne)
                    yield break;
                foreach (var factor in Factor(divisor))
                    yield return factor;
                n /= divisor;
            }
            yield return n;
        }

        public BigInteger GetDivisor(BigInteger n)
        {
            if (threads == 1)
            {
                var xInit = random.Next(n);
                var c = random.Next(n - BigInteger.One) + BigInteger.One;
                return Rho(n, xInit, c, CancellationToken.None);
            }
            var cancellationTokenSource = new CancellationTokenSource();
            var tasks = new Task<BigInteger>[threads];
            for (int i = 0; i < threads; i++)
                tasks[i] = StartNew(n, cancellationTokenSource.Token);
            var result = BigInteger.Zero;
            while (true)
            {
                var index = Task.WaitAny(tasks);
                result = tasks[index].Result;
                if (result != BigInteger.Zero)
                    break;
                tasks[index] = StartNew(n, cancellationTokenSource.Token);
            }
            cancellationTokenSource.Cancel();
            return result;
        }

        private Task<BigInteger> StartNew(BigInteger n, CancellationToken cancellationToken)
        {
            var xInit = random.Next(n);
            var c = random.Next(n - BigInteger.One) + BigInteger.One;
            return Task.Factory.StartNew(() => Rho(n, xInit, c, cancellationToken));
        }

        protected static BigInteger F(BigInteger x, BigInteger c, BigInteger n)
        {
            return (x * x + c) % n;
        }

        protected abstract BigInteger Rho(BigInteger n, BigInteger xInit, BigInteger c, CancellationToken cancellationToken);
    }
}
