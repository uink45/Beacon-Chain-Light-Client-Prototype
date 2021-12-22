using System;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public sealed class UInt128Operations : Operations<UInt128>
    {
        public override Type Type { get { return typeof(UInt128); } }
        public override UInt128 MinValue { get { return UInt128.MinValue; } }
        public override UInt128 MaxValue { get { return UInt128.MaxValue; } }
        public override UInt128 Zero { get { return UInt128.Zero; } }
        public override UInt128 One { get { return UInt128.One; } }
        public override bool IsUnsigned { get { return true; } }
        public override UInt128 Convert(int a) { return (UInt128)a; }
        public override UInt128 Convert(BigInteger a) { return (UInt128)a; }
        public override UInt128 Convert(double a) { return (UInt128)a; }
        public override int ToInt32(UInt128 a) { return (int)a; }
        public override BigInteger ToBigInteger(UInt128 a) { return a; }
        public override double ToDouble(UInt128 a) { return (double)a; }
        public override UInt128 Add(UInt128 a, UInt128 b) { return a + b; }
        public override UInt128 Subtract(UInt128 a, UInt128 b) { return a - b; }
        public override UInt128 Multiply(UInt128 a, UInt128 b) { return a * b; }
        public override UInt128 Divide(UInt128 a, UInt128 b) { return a / b; }
        public override UInt128 Remainder(UInt128 a, UInt128 b) { return a % b; }
        public override UInt128 Modulo(UInt128 a, UInt128 b) { return a % b; }
        public override UInt128 Negate(UInt128 a) { return 0 - a; }
        public override UInt128 LeftShift(UInt128 a, int n) { return n < 64 ? a << n : 0; }
        public override UInt128 RightShift(UInt128 a, int n) { return n < 64 ? a >> n : 0; }
        public override UInt128 And(UInt128 a, UInt128 b) { return a & b; }
        public override UInt128 Or(UInt128 a, UInt128 b) { return a | b; }
        public override UInt128 ExclusiveOr(UInt128 a, UInt128 b) { return a ^ b; }
        public override UInt128 OnesComplement(UInt128 a) { return ~a; }
        public override int Sign(UInt128 a) { return a.Sign; }
        public override bool IsZero(UInt128 a) { return a.IsZero; }
        public override bool IsOne(UInt128 a) { return a.IsOne; }
        public override bool IsEven(UInt128 a) { return a.IsEven; }
        public override bool Equals(UInt128 x, UInt128 y) { return x.Equals(y); }
        public override int GetHashCode(UInt128 obj) { return obj.GetHashCode(); }
        public override int Compare(UInt128 x, UInt128 y) { return x.CompareTo(y); }
        public override uint LeastSignificantWord(UInt128 a) { return (uint)a.S0; }

        public override UInt128 Power(UInt128 a, UInt128 b) { return IntegerMath.Power(a, b); }
        public override UInt128 Root(UInt128 a, UInt128 b) { return IntegerMath.Root(a, b); }
        public override UInt128 GreatestCommonDivisor(UInt128 a, UInt128 b) { return UInt128.GreatestCommonDivisor(a, b); }
        public override UInt128 ModularSum(UInt128 a, UInt128 b, UInt128 modulus) { return UInt128.ModAdd(a, b, modulus); }
        public override UInt128 ModularDifference(UInt128 a, UInt128 b, UInt128 modulus) { return UInt128.ModSub(a, b, modulus); }
        public override UInt128 ModularProduct(UInt128 a, UInt128 b, UInt128 modulus) { return UInt128.ModMul(a, b, modulus); }
        public override UInt128 ModularQuotient(UInt128 a, UInt128 b, UInt128 modulus) { return (UInt128)IntegerMath.ModularQuotient(a, b, modulus); }
        public override UInt128 ModularPower(UInt128 value, UInt128 exponent, UInt128 modulus) { return UInt128.ModPow(value, exponent, modulus); }
        public override UInt128 ModularRoot(UInt128 value, UInt128 exponent, UInt128 modulus) { return (UInt128)IntegerMath.ModularRoot(value, exponent, modulus); }
        public override UInt128 ModularInverse(UInt128 value, UInt128 modulus) { return (UInt128)IntegerMath.ModularInverse(value, modulus); }

        public override UInt128 AbsoluteValue(UInt128 a) { return a; }
        public override Complex Log(UInt128 a) { return Math.Log((double)a); }
        public override UInt128 Factorial(UInt128 a) { return (UInt128)IntegerMath.Factorial(a); }
    }
}
