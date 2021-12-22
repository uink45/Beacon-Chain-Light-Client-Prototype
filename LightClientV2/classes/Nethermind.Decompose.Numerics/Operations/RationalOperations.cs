using System;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public sealed class RationalOperations : Operations<Rational>
    {
        public override Type Type { get { return typeof(Rational); } }
        public override Rational MinValue { get { return 0; } }
        public override Rational MaxValue { get { return 0; } }
        public override Rational Zero { get { return 0; } }
        public override Rational One { get { return 1; } }
        public override bool IsUnsigned { get { return false; } }
        public override Rational Convert(int a) { return a; }
        public override Rational Convert(BigInteger a) { return a; }
        public override Rational Convert(double a) { return (Rational)a; }
        public override int ToInt32(Rational a) { return (int)a; }
        public override BigInteger ToBigInteger(Rational a) { return (BigInteger)a; }
        public override double ToDouble(Rational a) { return (double)a; }
        public override Rational Add(Rational a, Rational b) { return a + b; }
        public override Rational Subtract(Rational a, Rational b) { return a - b; }
        public override Rational Multiply(Rational a, Rational b) { return a * b; }
        public override Rational Divide(Rational a, Rational b) { return a / b; }
        public override Rational Remainder(Rational a, Rational b) { return a - Rational.Truncate(a / b) * b; }
        public override Rational Modulo(Rational a, Rational b) { return IntegerMath.Modulus(a, (BigInteger)b); }
        public override Rational Negate(Rational a) { return -a; }
        public override Rational LeftShift(Rational a, int n) { return (BigInteger)a << n; }
        public override Rational RightShift(Rational a, int n) { return (BigInteger)a >> n; }
        public override Rational And(Rational a, Rational b) { return (BigInteger)a & (BigInteger)b; }
        public override Rational Or(Rational a, Rational b) { return (BigInteger)a | (BigInteger)b; }
        public override Rational ExclusiveOr(Rational a, Rational b) { return (BigInteger)a ^ (BigInteger)b; }
        public override Rational OnesComplement(Rational a) { return ~(BigInteger)a; }
        public override int Sign(Rational a) { return (a.Numerator.Sign); }
        public override bool IsZero(Rational a) { return a.Numerator.IsZero; }
        public override bool IsOne(Rational a) { return a.Denominator == 1 && a.Numerator.IsOne; }
        public override bool IsEven(Rational a) { return a.Denominator == 1 && a.Numerator.IsEven; }
        public override bool Equals(Rational x, Rational y) { return x.Equals(y); }
        public override int GetHashCode(Rational obj) { return obj.GetHashCode(); }
        public override int Compare(Rational x, Rational y) { return x.CompareTo(y); }
        public override uint LeastSignificantWord(Rational a) { return (uint)((BigInteger)a & uint.MaxValue); }

        public override Rational Power(Rational a, Rational b) { return IntegerMath.Power(a, b); }
        public override Rational Root(Rational a, Rational b) { return IntegerMath.Root((BigInteger)a, (BigInteger)b); }
        public override Rational GreatestCommonDivisor(Rational a, Rational b) { return IntegerMath.GreatestCommonDivisor((BigInteger)a, (BigInteger)b); }
        public override Rational ModularSum(Rational a, Rational b, Rational modulus) { return IntegerMath.ModularSum((BigInteger)a, (BigInteger)b, (BigInteger)modulus); }
        public override Rational ModularDifference(Rational a, Rational b, Rational modulus) { return IntegerMath.ModularDifference((BigInteger)a, (BigInteger)b, (BigInteger)modulus); }
        public override Rational ModularProduct(Rational a, Rational b, Rational modulus) { return IntegerMath.ModularProduct((BigInteger)a, (BigInteger)b, (BigInteger)modulus); }
        public override Rational ModularQuotient(Rational a, Rational b, Rational modulus) { return IntegerMath.ModularQuotient((BigInteger)a, (BigInteger)b, (BigInteger)modulus); }
        public override Rational ModularPower(Rational value, Rational exponent, Rational modulus) { return IntegerMath.ModularPower(value, exponent, modulus); }
        public override Rational ModularRoot(Rational value, Rational exponent, Rational modulus) { return IntegerMath.ModularRoot((BigInteger)value, (BigInteger)exponent, (BigInteger)modulus); }
        public override Rational ModularInverse(Rational value, Rational modulus) { return IntegerMath.ModularInverse((BigInteger)value, (BigInteger)modulus); }

        public override Rational AbsoluteValue(Rational a) { return Rational.Abs(a); }
        public override Complex Log(Rational a) { return Rational.Log(a); }
        public override Rational Factorial(Rational a) { return IntegerMath.Factorial((BigInteger)a); }
    }
}
