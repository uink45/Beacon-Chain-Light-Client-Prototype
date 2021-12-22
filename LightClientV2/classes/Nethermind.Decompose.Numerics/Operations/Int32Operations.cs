using System;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public sealed class Int32Operations : Operations<int>
    {
        public override Type Type { get { return typeof(int); } }
        public override int MinValue { get { return int.MinValue; } }
        public override int MaxValue { get { return int.MaxValue; } }
        public override int Zero { get { return 0; } }
        public override int One { get { return 1; } }
        public override bool IsUnsigned { get { return false; } }
        public override int Convert(int a) { return (int)a; }
        public override int Convert(BigInteger a) { return (int)a; }
        public override int Convert(double a) { return (int)a; }
        public override int ToInt32(int a) { return a; }
        public override BigInteger ToBigInteger(int a) { return a; }
        public override double ToDouble(int a) { return (double)a; }
        public override int Add(int a, int b) { return a + b; }
        public override int Subtract(int a, int b) { return a - b; }
        public override int Multiply(int a, int b) { return a * b; }
        public override int Divide(int a, int b) { return a / b; }
        public override int Remainder(int a, int b) { return a % b; }
        public override int Modulo(int a, int b) { var result = a % b; if (result < 0) result += b; return result; }
        public override int Negate(int a) { return 0 - a; }
        public override int LeftShift(int a, int n) { return n < 32 ? a << n : 0; }
        public override int RightShift(int a, int n) { return n < 32 ? a >> n : 0; }
        public override int And(int a, int b) { return a & b; }
        public override int Or(int a, int b) { return a | b; }
        public override int ExclusiveOr(int a, int b) { return a ^ b; }
        public override int OnesComplement(int a) { return ~a; }
        public override int Sign(int a) { return Math.Sign(a); }
        public override bool IsZero(int a) { return a == 0; }
        public override bool IsOne(int a) { return a == 1; }
        public override bool IsEven(int a) { return (a & 1) == 0; }
        public override bool Equals(int x, int y) { return x.Equals(y); }
        public override int GetHashCode(int obj) { return obj.GetHashCode(); }
        public override int Compare(int x, int y) { return x.CompareTo(y); }
        public override uint LeastSignificantWord(int a) { return (uint)(a & uint.MaxValue); }

        public override int Power(int a, int b) { return IntegerMath.Power(a, b); }
        public override int Root(int a, int b) { return IntegerMath.Root(a, b); }
        public override int GreatestCommonDivisor(int a, int b) { return IntegerMath.GreatestCommonDivisor(a, b); }
        public override int ModularSum(int a, int b, int modulus) { return IntegerMath.ModularSum(a, b, modulus); }
        public override int ModularDifference(int a, int b, int modulus) { return IntegerMath.ModularDifference(a, b, modulus); }
        public override int ModularProduct(int a, int b, int modulus) { return IntegerMath.ModularProduct(a, b, modulus); }
        public override int ModularQuotient(int a, int b, int modulus) { return IntegerMath.ModularQuotient(a, b, modulus); }
        public override int ModularPower(int value, int exponent, int modulus) { return IntegerMath.ModularPower(value, exponent, modulus); }
        public override int ModularRoot(int value, int exponent, int modulus) { return IntegerMath.ModularRoot(value, exponent, modulus); }
        public override int ModularInverse(int value, int modulus) { return IntegerMath.ModularInverse(value, modulus); }

        public override int AbsoluteValue(int a) { return Math.Abs(a); }
        public override Complex Log(int a) { return Math.Log(a); }
        public override int Factorial(int a) { return IntegerMath.Factorial(a); }
    }
}
