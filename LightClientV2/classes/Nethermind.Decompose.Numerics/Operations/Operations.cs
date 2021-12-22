using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public abstract class Operations
    {
        public abstract Type Type { get; }

        private static Dictionary<Type, Operations> operations = new Dictionary<Type, Operations>
        {
            { typeof(double), new DoubleOperations() },
            { typeof(int), new Int32Operations() },
            { typeof(uint), new UInt32Operations() },
            { typeof(long), new Int64Operations() },
            { typeof(ulong), new UInt64Operations() },
            { typeof(Int128), new Int128Operations() },
            { typeof(UInt128), new UInt128Operations() },
            { typeof(BigInteger), new BigIntegerOperations() },
            { typeof(Complex), new ComplexOperations() },
            { typeof(Rational), new RationalOperations() },
        };

        public static Operations<T> Get<T>()
        {
            var type = typeof(T);
            Operations ops;
            if (!operations.TryGetValue(typeof(T), out ops))
                throw new NotImplementedException("type not supported");
            return (Operations<T>)ops;
        }
    }

    public abstract class Operations<T> : Operations, IEqualityComparer<T>, IComparer<T>
    {
        public abstract bool IsUnsigned { get; }
        public abstract T MinValue { get; }
        public abstract T MaxValue { get; }
        public abstract T Zero { get; }
        public abstract T One { get; }
        public abstract T Convert(int a);
        public abstract T Convert(BigInteger a);
        public abstract T Convert(double a);
        public abstract int ToInt32(T a);
        public abstract BigInteger ToBigInteger(T a);
        public abstract double ToDouble(T a);
        public abstract T Add(T a, T b);
        public abstract T Subtract(T a, T b);
        public abstract T Multiply(T a, T b);
        public abstract T Divide(T a, T b);
        public abstract T Modulo(T a, T b);
        public abstract T Remainder(T a, T b);
        public abstract T Power(T a, T b);
        public abstract T Root(T a, T b);
        public abstract T Negate(T a);
        public abstract T LeftShift(T a, int n);
        public abstract T RightShift(T a, int n);
        public abstract T And(T a, T b);
        public abstract T Or(T a, T b);
        public abstract T ExclusiveOr(T a, T b);
        public abstract T OnesComplement(T a);
        public abstract int Sign(T a);
        public abstract bool IsZero(T a);
        public abstract bool IsOne(T a);
        public abstract bool IsEven(T a);
        public abstract uint LeastSignificantWord(T a);

        public abstract T GreatestCommonDivisor(T a, T b);
        public abstract T ModularSum(T a, T b, T modulus);
        public abstract T ModularDifference(T a, T b, T modulus);
        public abstract T ModularProduct(T a, T b, T modulus);
        public abstract T ModularQuotient(T a, T b, T modulus);
        public abstract T ModularPower(T value, T exponent, T modulus);
        public abstract T ModularRoot(T value, T exponent, T modulus);
        public abstract T ModularInverse(T value, T modulus);

        public abstract T AbsoluteValue(T a);
        public abstract Complex Log(T value);
        public abstract T Factorial(T a);

        public abstract int Compare(T a, T b);
        public abstract bool Equals(T a, T b);
        public abstract int GetHashCode(T a);
    }
}
