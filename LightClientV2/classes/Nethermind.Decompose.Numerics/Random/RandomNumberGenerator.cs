using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public abstract class RandomNumberGenerator : IRandomNumberGenerator
    {
        private abstract class RandomNumberAlgorithm<T> : IRandomNumberAlgorithm<T>
        {
            protected IRandomNumberGenerator random;

            protected RandomNumberAlgorithm(IRandomNumberGenerator random)
            {
                this.random = random;
            }

            public abstract T Next(T n);

            public IEnumerable<T> Sequence(T n)
            {
                while (true)
                    yield return Next(n);
            }
        }

        private class NumberRandomNumberAlgorithm<T> : RandomNumberAlgorithm<Number<T>>
        {
            private IRandomNumberAlgorithm<T> trandom;

            public NumberRandomNumberAlgorithm(IRandomNumberGenerator random)
                : base(random)
            {
                trandom = random.Create<T>();
            }

            public override Number<T> Next(Number<T> n)
            {
                return trandom.Next(n);
            }
        }

        private class Int32RandomNumberAlgorithm : RandomNumberAlgorithm<int>
        {
            public Int32RandomNumberAlgorithm(IRandomNumberGenerator random)
                : base(random)
            {
            }

            public override int Next(int n)
            {
                lock (random.SyncRoot)
                {
                    var next = (int)(random.Next() >> 1);
                    return n == 0 ? next : next % n;
                }
            }
        }

        private class UInt32RandomNumberAlgorithm : RandomNumberAlgorithm<uint>
        {
            public UInt32RandomNumberAlgorithm(IRandomNumberGenerator random)
                : base(random)
            {
            }

            public override UInt32 Next(uint n)
            {
                lock (random.SyncRoot)
                {
                    var next = random.Next();
                    return n == 0 ? next : next % n;
                }
            }
        }

        private class Int64RandomNumberAlgorithm : RandomNumberAlgorithm<long>
        {
            public Int64RandomNumberAlgorithm(IRandomNumberGenerator random)
                : base(random)
            {
            }

            public override long Next(long n)
            {
                lock (random.SyncRoot)
                {
                    var next = (long)((ulong)(random.Next() >> 1) << 32 | random.Next());
                    return n == 0 ? next : next % n;
                }
            }
        }

        private class UInt64RandomNumberAlgorithm : RandomNumberAlgorithm<ulong>
        {
            public UInt64RandomNumberAlgorithm(IRandomNumberGenerator random)
                : base(random)
            {
            }

            public override ulong Next(ulong n)
            {
                lock (random.SyncRoot)
                {
                    var next = (ulong)random.Next() << 32 | random.Next();
                    return n == 0 ? next : next % n;
                }
            }
        }

        private class Int128RandomNumberAlgorithm : RandomNumberAlgorithm<Int128>
        {
            public Int128RandomNumberAlgorithm(IRandomNumberGenerator random)
                : base(random)
            {
            }

            public override Int128 Next(Int128 n)
            {
                lock (random.SyncRoot)
                {
                    var next = (Int128)((UInt128)(random.Next() >> 1) << 96 | (UInt128)random.Next() << 64 | (UInt128)random.Next() << 32 | random.Next());
                    return n == 0 ? next : next % n;
                }
            }
        }

        private class UInt128RandomNumberAlgorithm : RandomNumberAlgorithm<UInt128>
        {
            public UInt128RandomNumberAlgorithm(IRandomNumberGenerator random)
                : base(random)
            {
            }

            public override UInt128 Next(UInt128 n)
            {
                lock (random.SyncRoot)
                {
                    var next = (UInt128)random.Next() << 96 | (UInt128)random.Next() << 64 | (UInt128)random.Next() << 32 | random.Next();
                    return n == 0 ? next : next % n;
                }
            }
        }

        private class BigIntegerRandomNumberAlgorithm : RandomNumberAlgorithm<BigInteger>
        {
            public BigIntegerRandomNumberAlgorithm(IRandomNumberGenerator random)
                : base(random)
            {
            }

            public override BigInteger Next(BigInteger n)
            {
                lock (random.SyncRoot)
                {
                    var c = (n.ToByteArray().Length + 3) / 4 * 4;
                    var bytes = new byte[c + 1];
                    for (int i = 0; i < c; i += 4)
                        BitConverter.GetBytes(random.Next()).CopyTo(bytes, i);
                    return new BigInteger(bytes) % n;
                }
            }
        }

        private class DoubleRandomNumberAlgorithm : RandomNumberAlgorithm<double>
        {
            public DoubleRandomNumberAlgorithm(IRandomNumberGenerator random)
                : base(random)
            {
            }

            public override double Next(double n)
            {
                lock (random.SyncRoot)
                {
                    var next = (double)((ulong)random.Next() << 32 | random.Next()) / ulong.MaxValue;
                    return next * n;
                }
            }
        }

        private class ComplexRandomNumberAlgorithm : RandomNumberAlgorithm<Complex>
        {
            public ComplexRandomNumberAlgorithm(IRandomNumberGenerator random)
                : base(random)
            {
            }

            public override Complex Next(Complex n)
            {
                lock (random.SyncRoot)
                {
                    var real = (double)((ulong)random.Next() << 32 | random.Next()) / ulong.MaxValue;
                    var imag = (double)((ulong)random.Next() << 32 | random.Next()) / ulong.MaxValue;
                    return new Complex(real * n.Real, imag * n.Imaginary);
                }
            }
        }

        private class RationalRandomNumberAlgorithm : RandomNumberAlgorithm<Rational>
        {
            public RationalRandomNumberAlgorithm(IRandomNumberGenerator random)
                : base(random)
            {
            }

            public override Rational Next(Rational n)
            {
                lock (random.SyncRoot)
                {
                    var c = (n.Numerator.ToByteArray().Length + 3) / 4 * 4;
                    var bytes = new byte[c + 1];
                    for (int i = 0; i < c; i += 4)
                        BitConverter.GetBytes(random.Next()).CopyTo(bytes, i);
                    return new Rational(new BigInteger(bytes) % n.Numerator, n.Denominator);
                }
            }
        }

        private object syncRoot = new object();

        public object SyncRoot { get { return syncRoot; } }

        public abstract uint Next();

        public IRandomNumberAlgorithm<Number<T>> CreateNumber<T>()
        {
            return new NumberRandomNumberAlgorithm<T>(this);
        }

        public IRandomNumberAlgorithm<T> Create<T>()
        {
            var type = typeof(T);
            if (type == typeof(int))
                return (IRandomNumberAlgorithm<T>)new Int32RandomNumberAlgorithm(this);
            if (type == typeof(uint))
                return (IRandomNumberAlgorithm<T>)new UInt32RandomNumberAlgorithm(this);
            if (type == typeof(long))
                return (IRandomNumberAlgorithm<T>)new Int64RandomNumberAlgorithm(this);
            if (type == typeof(ulong))
                return (IRandomNumberAlgorithm<T>)new UInt64RandomNumberAlgorithm(this);
            if (type == typeof(Int128))
                return (IRandomNumberAlgorithm<T>)new Int128RandomNumberAlgorithm(this);
            if (type == typeof(UInt128))
                return (IRandomNumberAlgorithm<T>)new UInt128RandomNumberAlgorithm(this);
            if (type == typeof(BigInteger))
                return (IRandomNumberAlgorithm<T>)new BigIntegerRandomNumberAlgorithm(this);
            if (type == typeof(Rational))
                return (IRandomNumberAlgorithm<T>)new RationalRandomNumberAlgorithm(this);
            if (type == typeof(double))
                return (IRandomNumberAlgorithm<T>)new DoubleRandomNumberAlgorithm(this);
            if (type == typeof(Complex))
                return (IRandomNumberAlgorithm<T>)new ComplexRandomNumberAlgorithm(this);
            throw new NotImplementedException("type not supported");
        }
    }
}
