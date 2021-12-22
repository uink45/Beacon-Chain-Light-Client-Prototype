using System;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public sealed class Int64Operations : Operations<long>
    {
        public override Type Type { get { return typeof(long); } }
        public override long MinValue { get { return long.MinValue; } }
        public override long MaxValue { get { return long.MaxValue; } }
        public override long Zero { get { return 0; } }
        public override long One { get { return 1; } }
        public override bool IsUnsigned { get { return true; } }
        public override long Convert(int a) { return (long)a; }
        public override long Convert(BigInteger a) { return (long)a; }
        public override long Convert(double a) { return (long)a; }
        public override int ToInt32(long a) { return (int)a; }
        public override BigInteger ToBigInteger(long a) { return a; }
        public override double ToDouble(long a) { return (double)a; }
        public override long Add(long a, long b) { return a + b; }
        public override long Subtract(long a, long b) { return a - b; }
        public override long Multiply(long a, long b) { return a * b; }
        public override long Divide(long a, long b) { return a / b; }
        public override long Remainder(long a, long b) { return a % b; }
        public override long Modulo(long a, long b) { var result = a % b; if (result < 0) result += b; return result; }
        public override long Negate(long a) { return 0 - a; }
        public override long LeftShift(long a, int n) { return n < 64 ? a << n : 0; }
        public override long RightShift(long a, int n) { return n < 64 ? a >> n : 0; }
        public override long And(long a, long b) { return a & b; }
        public override long Or(long a, long b) { return a | b; }
        public override long ExclusiveOr(long a, long b) { return a ^ b; }
        public override long OnesComplement(long a) { return ~a; }
        public override int Sign(long a) { return Math.Sign(a); }
        public override bool IsZero(long a) { return a == 0; }
        public override bool IsOne(long a) { return a == 1; }
        public override bool IsEven(long a) { return (a & 1) == 0; }
        public override bool Equals(long x, long y) { return x.Equals(y); }
        public override int GetHashCode(long obj) { return obj.GetHashCode(); }
        public override int Compare(long x, long y) { return x.CompareTo(y); }
        public override uint LeastSignificantWord(long a) { return (uint)(a & uint.MaxValue); }

        public override long Power(long a, long b) { return IntegerMath.Power(a, b); }
        public override long Root(long a, long b) { return IntegerMath.Root(a, b); }
        public override long GreatestCommonDivisor(long a, long b) { return IntegerMath.GreatestCommonDivisor(a, b); }
        public override long ModularSum(long a, long b, long modulus) { return IntegerMath.ModularSum(a, b, modulus); }
        public override long ModularDifference(long a, long b, long modulus) { return IntegerMath.ModularDifference(a, b, modulus); }
        public override long ModularProduct(long a, long b, long modulus) { return IntegerMath.ModularProduct(a, b, modulus); }
        public override long ModularQuotient(long a, long b, long modulus) { return IntegerMath.ModularQuotient(a, b, modulus); }
        public override long ModularPower(long value, long exponent, long modulus) { return IntegerMath.ModularPower(value, exponent, modulus); }
        public override long ModularRoot(long value, long exponent, long modulus) { return IntegerMath.ModularRoot(value, exponent, modulus); }
        public override long ModularInverse(long value, long modulus) { return IntegerMath.ModularInverse(value, modulus); }

        public override long AbsoluteValue(long a) { return Math.Abs(a); }
        public override Complex Log(long a) { return Math.Log(a); }
        public override long Factorial(long a) { return IntegerMath.Factorial(a); }
    }
}
