using System;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public sealed class DoubleOperations : Operations<double>
    {
        public override Type Type { get { return typeof(double); } }
        public override double MinValue { get { return double.MinValue; } }
        public override double MaxValue { get { return double.MaxValue; } }
        public override double Zero { get { return 0; } }
        public override double One { get { return 1; } }
        public override bool IsUnsigned { get { return false; } }
        public override double Convert(int a) { return (double)a; }
        public override double Convert(BigInteger a) { return (double)a; }
        public override double Convert(double a) { return a; }
        public override int ToInt32(double a) { if ((int)a != a) throw new InvalidCastException("not an integer"); return (int)a; }
        public override BigInteger ToBigInteger(double a) { return (BigInteger)a; }
        public override double ToDouble(double a) { return a; }
        public override double Add(double a, double b) { return a + b; }
        public override double Subtract(double a, double b) { return a - b; }
        public override double Multiply(double a, double b) { return a * b; }
        public override double Divide(double a, double b) { return a / b; }
        public override double Remainder(double a, double b) { return a % b; }
        public override double Modulo(double a, double b) { var result = a % b; if (result < 0) result += b; return result; }
        public override double Negate(double a) { return 0 - a; }
        public override double LeftShift(double a, int n) { return a * Math.Pow(2, n); }
        public override double RightShift(double a, int n) { return a / Math.Pow(2, n); }
        public override double And(double a, double b) { return (double)(ToBigInteger(a) & ToBigInteger(b)); }
        public override double Or(double a, double b) { return (double)(ToBigInteger(a) | ToBigInteger(b)); }
        public override double ExclusiveOr(double a, double b) { return (double)(ToBigInteger(a) ^ ToBigInteger(b)); }
        public override double OnesComplement(double a) { return (double)~ToBigInteger(a); }
        public override int Sign(double a) { return Math.Sign(a); }
        public override bool IsZero(double a) { return a == 0; }
        public override bool IsOne(double a) { return a == 1; }
        public override bool IsEven(double a) { return a % 2 == 0; }
        public override bool Equals(double x, double y) { return x.Equals(y); }
        public override int GetHashCode(double obj) { return obj.GetHashCode(); }
        public override int Compare(double x, double y) { return x.CompareTo(y); }
        public override uint LeastSignificantWord(double a) { return (uint)(ToBigInteger(a) & uint.MaxValue); }

        public override double Power(double a, double b) { return Math.Pow(a, b); }
        public override double Root(double a, double b) { return Math.Pow(a, 1 / b); }
        public override double GreatestCommonDivisor(double a, double b) { return (double)IntegerMath.GreatestCommonDivisor(ToBigInteger(a), ToBigInteger(b)); }
        public override double ModularSum(double a, double b, double modulus) { return (double)IntegerMath.ModularSum(ToBigInteger(a), ToBigInteger(b), ToBigInteger(modulus)); }
        public override double ModularDifference(double a, double b, double modulus) { return (double)IntegerMath.ModularDifference(ToBigInteger(a), ToBigInteger(b), ToBigInteger(modulus)); }
        public override double ModularProduct(double a, double b, double modulus) { return (double)IntegerMath.ModularProduct(ToBigInteger(a), ToBigInteger(b), ToBigInteger(modulus)); }
        public override double ModularQuotient(double a, double b, double modulus) { return (double)IntegerMath.ModularQuotient(ToBigInteger(a), ToBigInteger(b), ToBigInteger(modulus)); }
        public override double ModularPower(double value, double exponent, double modulus) { return (double)IntegerMath.ModularPower(ToBigInteger(value), ToBigInteger(exponent), ToBigInteger(modulus)); }
        public override double ModularRoot(double value, double exponent, double modulus) { return (double)IntegerMath.ModularRoot(ToBigInteger(value), ToBigInteger(exponent), ToBigInteger(modulus)); }
        public override double ModularInverse(double value, double modulus) { return (double)IntegerMath.ModularInverse(ToBigInteger(value), ToBigInteger(modulus)); }

        public override double AbsoluteValue(double a) { return Math.Abs(a); }
        public override Complex Log(double a) { return Math.Log(a); }
        public override double Factorial(double a) { return IntegerMath.Factorial((int)a); }
    }
}
