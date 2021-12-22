using System;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public sealed class BigIntegerOperations : Operations<BigInteger>
    {
        public override Type Type { get { return typeof(BigInteger); } }
        public override BigInteger MinValue { get { return BigInteger.Zero; } }
        public override BigInteger MaxValue { get { return BigInteger.Zero; } }
        public override BigInteger Zero { get { return BigInteger.Zero; } }
        public override BigInteger One { get { return BigInteger.One; } }
        public override bool IsUnsigned { get { return false; } }
        public override BigInteger Convert(int a) { return a; }
        public override BigInteger Convert(BigInteger a) { return a; }
        public override BigInteger Convert(double a) { return (BigInteger)a; }
        public override int ToInt32(BigInteger a) { return (int)a; }
        public override BigInteger ToBigInteger(BigInteger a) { return a; }
        public override double ToDouble(BigInteger a) { return (double)a; }
        public override BigInteger Add(BigInteger a, BigInteger b) { return a + b; }
        public override BigInteger Subtract(BigInteger a, BigInteger b) { return a - b; }
        public override BigInteger Multiply(BigInteger a, BigInteger b) { return a * b; }
        public override BigInteger Divide(BigInteger a, BigInteger b) { return a / b; }
        public override BigInteger Modulo(BigInteger a, BigInteger b) { var result = a % b; if (result.Sign == -1) result += b; return result; }
        public override BigInteger Remainder(BigInteger a, BigInteger b) { return a % b; }
        public override BigInteger Negate(BigInteger a) { return -a; }
        public override BigInteger LeftShift(BigInteger a, int n) { return a << n; }
        public override BigInteger RightShift(BigInteger a, int n) { return a >> n; }
        public override BigInteger And(BigInteger a, BigInteger b) { return a & b; }
        public override BigInteger Or(BigInteger a, BigInteger b) { return a | b; }
        public override BigInteger ExclusiveOr(BigInteger a, BigInteger b) { return a ^ b; }
        public override BigInteger OnesComplement(BigInteger a) { return ~a; }
        public override int Sign(BigInteger a) { return a.Sign; }
        public override bool IsZero(BigInteger a) { return a.IsZero; }
        public override bool IsOne(BigInteger a) { return a.IsOne; }
        public override bool IsEven(BigInteger a) { return a.IsEven; }
        public override bool Equals(BigInteger x, BigInteger y) { return x.Equals(y); }
        public override int GetHashCode(BigInteger obj) { return obj.GetHashCode(); }
        public override int Compare(BigInteger x, BigInteger y) { return x.CompareTo(y); }
        public override uint LeastSignificantWord(BigInteger a) { return (uint)(a & uint.MaxValue); }

        public override BigInteger Power(BigInteger a, BigInteger b) { return IntegerMath.Power(a, b); }
        public override BigInteger Root(BigInteger a, BigInteger b) { return IntegerMath.Root(a, b); }
        public override BigInteger GreatestCommonDivisor(BigInteger a, BigInteger b) { return IntegerMath.GreatestCommonDivisor(a, b); }
        public override BigInteger ModularSum(BigInteger a, BigInteger b, BigInteger modulus) { return IntegerMath.ModularSum(a, b, modulus); }
        public override BigInteger ModularDifference(BigInteger a, BigInteger b, BigInteger modulus) { return IntegerMath.ModularDifference(a, b, modulus); }
        public override BigInteger ModularProduct(BigInteger a, BigInteger b, BigInteger modulus) { return IntegerMath.ModularProduct(a, b, modulus); }
        public override BigInteger ModularQuotient(BigInteger a, BigInteger b, BigInteger modulus) { return IntegerMath.ModularQuotient(a, b, modulus); }
        public override BigInteger ModularPower(BigInteger value, BigInteger exponent, BigInteger modulus) { return IntegerMath.ModularPower(value, exponent, modulus); }
        public override BigInteger ModularRoot(BigInteger value, BigInteger exponent, BigInteger modulus) { return IntegerMath.ModularRoot(value, exponent, modulus); }
        public override BigInteger ModularInverse(BigInteger value, BigInteger modulus) { return IntegerMath.ModularInverse(value, modulus); }

        public override BigInteger AbsoluteValue(BigInteger a) { return BigInteger.Abs(a); }
        public override Complex Log(BigInteger a) { return BigInteger.Log(a); }
        public override BigInteger Factorial(BigInteger a) { return IntegerMath.Factorial(a); }
    }
}
