using System;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public sealed class Int128Operations : Operations<Int128>
    {
        public override Type Type { get { return typeof(Int128); } }
        public override Int128 MinValue { get { return Int128.MinValue; } }
        public override Int128 MaxValue { get { return Int128.MaxValue; } }
        public override Int128 Zero { get { return Int128.Zero; } }
        public override Int128 One { get { return Int128.One; } }
        public override bool IsUnsigned { get { return false; } }
        public override Int128 Convert(int a) { return (Int128)a; }
        public override Int128 Convert(BigInteger a) { return (Int128)a; }
        public override Int128 Convert(double a) { return (Int128)a; }
        public override int ToInt32(Int128 a) { return (int)a; }
        public override BigInteger ToBigInteger(Int128 a) { return a; }
        public override double ToDouble(Int128 a) { return (double)a; }
        public override Int128 Add(Int128 a, Int128 b) { return a + b; }
        public override Int128 Subtract(Int128 a, Int128 b) { return a - b; }
        public override Int128 Multiply(Int128 a, Int128 b) { return a * b; }
        public override Int128 Divide(Int128 a, Int128 b) { return a / b; }
        public override Int128 Remainder(Int128 a, Int128 b) { return a % b; }
        public override Int128 Modulo(Int128 a, Int128 b) { return a % b; }
        public override Int128 Negate(Int128 a) { return 0 - a; }
        public override Int128 LeftShift(Int128 a, int n) { return n < 64 ? a << n : 0; }
        public override Int128 RightShift(Int128 a, int n) { return n < 64 ? a >> n : 0; }
        public override Int128 And(Int128 a, Int128 b) { return a & b; }
        public override Int128 Or(Int128 a, Int128 b) { return a | b; }
        public override Int128 ExclusiveOr(Int128 a, Int128 b) { return a ^ b; }
        public override Int128 OnesComplement(Int128 a) { return ~a; }
        public override int Sign(Int128 a) { return a.Sign; }
        public override bool IsZero(Int128 a) { return a.IsZero; }
        public override bool IsOne(Int128 a) { return a.IsOne; }
        public override bool IsEven(Int128 a) { return a.IsEven; }
        public override bool Equals(Int128 x, Int128 y) { return x.Equals(y); }
        public override int GetHashCode(Int128 obj) { return obj.GetHashCode(); }
        public override int Compare(Int128 x, Int128 y) { return x.CompareTo(y); }
        public override uint LeastSignificantWord(Int128 a) { return (uint)a.S0; }

        public override Int128 Power(Int128 a, Int128 b) { return IntegerMath.Power(a, b); }
        public override Int128 Root(Int128 a, Int128 b) { return IntegerMath.Root(a, b); }
        public override Int128 GreatestCommonDivisor(Int128 a, Int128 b) { return Int128.GreatestCommonDivisor(a, b); }
        public override Int128 ModularSum(Int128 a, Int128 b, Int128 modulus) { return Int128.ModAdd(a, b, modulus); }
        public override Int128 ModularDifference(Int128 a, Int128 b, Int128 modulus) { return Int128.ModSub(a, b, modulus); }
        public override Int128 ModularProduct(Int128 a, Int128 b, Int128 modulus) { return Int128.ModMul(a, b, modulus); }
        public override Int128 ModularQuotient(Int128 a, Int128 b, Int128 modulus) { return (Int128)IntegerMath.ModularQuotient(a, b, modulus); }
        public override Int128 ModularPower(Int128 value, Int128 exponent, Int128 modulus) { return Int128.ModPow(value, exponent, modulus); }
        public override Int128 ModularRoot(Int128 value, Int128 exponent, Int128 modulus) { return (Int128)IntegerMath.ModularRoot(value, exponent, modulus); }
        public override Int128 ModularInverse(Int128 value, Int128 modulus) { return (Int128)IntegerMath.ModularInverse(value, modulus); }

        public override Int128 AbsoluteValue(Int128 a) { return Int128.Abs(a); }
        public override Complex Log(Int128 a) { return Math.Log((double)a); }
        public override Int128 Factorial(Int128 a) { return (Int128)IntegerMath.Factorial(a); }
    }
}
