using System;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public sealed class UInt64Operations : Operations<ulong>
    {
        public override Type Type { get { return typeof(ulong); } }
        public override ulong MinValue { get { return ulong.MinValue; } }
        public override ulong MaxValue { get { return ulong.MaxValue; } }
        public override ulong Zero { get { return 0; } }
        public override ulong One { get { return 1; } }
        public override bool IsUnsigned { get { return true; } }
        public override ulong Convert(int a) { return (ulong)a; }
        public override ulong Convert(BigInteger a) { return (ulong)a; }
        public override ulong Convert(double a) { return (ulong)a; }
        public override int ToInt32(ulong a) { return (int)a; }
        public override BigInteger ToBigInteger(ulong a) { return a; }
        public override double ToDouble(ulong a) { return (double)a; }
        public override ulong Add(ulong a, ulong b) { return a + b; }
        public override ulong Subtract(ulong a, ulong b) { return a - b; }
        public override ulong Multiply(ulong a, ulong b) { return a * b; }
        public override ulong Divide(ulong a, ulong b) { return a / b; }
        public override ulong Remainder(ulong a, ulong b) { return a % b; }
        public override ulong Modulo(ulong a, ulong b) { return a % b; }
        public override ulong Negate(ulong a) { return 0 - a; }
        public override ulong LeftShift(ulong a, int n) { return n < 64 ? a << n : 0; }
        public override ulong RightShift(ulong a, int n) { return n < 64 ? a >> n : 0; }
        public override ulong And(ulong a, ulong b) { return a & b; }
        public override ulong Or(ulong a, ulong b) { return a | b; }
        public override ulong ExclusiveOr(ulong a, ulong b) { return a ^ b; }
        public override ulong OnesComplement(ulong a) { return ~a; }
        public override int Sign(ulong a) { return a != 0 ? 1 : 0; }
        public override bool IsZero(ulong a) { return a == 0; }
        public override bool IsOne(ulong a) { return a == 1; }
        public override bool IsEven(ulong a) { return (a & 1) == 0; }
        public override bool Equals(ulong x, ulong y) { return x.Equals(y); }
        public override int GetHashCode(ulong obj) { return obj.GetHashCode(); }
        public override int Compare(ulong x, ulong y) { return x.CompareTo(y); }
        public override uint LeastSignificantWord(ulong a) { return (uint)(a & uint.MaxValue); }

        public override ulong Power(ulong a, ulong b) { return IntegerMath.Power(a, b); }
        public override ulong Root(ulong a, ulong b) { return IntegerMath.Root(a, b); }
        public override ulong GreatestCommonDivisor(ulong a, ulong b) { return IntegerMath.GreatestCommonDivisor(a, b); }
        public override ulong ModularSum(ulong a, ulong b, ulong modulus) { return IntegerMath.ModularSum(a, b, modulus); }
        public override ulong ModularDifference(ulong a, ulong b, ulong modulus) { return IntegerMath.ModularDifference(a, b, modulus); }
        public override ulong ModularProduct(ulong a, ulong b, ulong modulus) { return IntegerMath.ModularProduct(a, b, modulus); }
        public override ulong ModularQuotient(ulong a, ulong b, ulong modulus) { return IntegerMath.ModularQuotient(a, b, modulus); }
        public override ulong ModularPower(ulong value, ulong exponent, ulong modulus) { return IntegerMath.ModularPower(value, exponent, modulus); }
        public override ulong ModularRoot(ulong value, ulong exponent, ulong modulus) { return IntegerMath.ModularRoot(value, exponent, modulus); }
        public override ulong ModularInverse(ulong value, ulong modulus) { return IntegerMath.ModularInverse(value, modulus); }

        public override ulong AbsoluteValue(ulong a) { return a; }
        public override Complex Log(ulong a) { return Math.Log(a); }
        public override ulong Factorial(ulong a) { return IntegerMath.Factorial(a); }
    }
}
