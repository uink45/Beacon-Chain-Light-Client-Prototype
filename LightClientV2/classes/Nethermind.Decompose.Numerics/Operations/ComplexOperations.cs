using System;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public sealed class ComplexOperations : Operations<Complex>
    {
        public override Type Type { get { return typeof(Complex); } }
        public override Complex MinValue { get { return double.MinValue; } }
        public override Complex MaxValue { get { return double.MaxValue; } }
        public override Complex Zero { get { return 0; } }
        public override Complex One { get { return 1; } }
        public override bool IsUnsigned { get { return false; } }
        public override Complex Convert(int a) { return (Complex)a; }
        public override Complex Convert(BigInteger a) { return (Complex)a; }
        public override Complex Convert(double a) { return a; }
        public override int ToInt32(Complex a) { return (int)ToDouble(a); }
        public override BigInteger ToBigInteger(Complex a) { return (BigInteger)ToDouble(a); }
        public override double ToDouble(Complex a) { if (a != a.Real) throw new InvalidCastException("not real"); return a.Real; }
        public override Complex Add(Complex a, Complex b) { return a + b; }
        public override Complex Subtract(Complex a, Complex b) { return a - b; }
        public override Complex Multiply(Complex a, Complex b) { return a * b; }
        public override Complex Divide(Complex a, Complex b) { return a / b; }
        public override Complex Remainder(Complex a, Complex b) { return ToDouble(a) % ToDouble(b); }
        public override Complex Modulo(Complex a, Complex b) { var result = ToDouble(a) % ToDouble(b); if (result < 0) result += ToDouble(b); return result; }
        public override Complex Negate(Complex a) { return 0 - a; }
        public override Complex LeftShift(Complex a, int n) { return a * Math.Pow(2, n); }
        public override Complex RightShift(Complex a, int n) { return a / Math.Pow(2, n); }
        public override Complex And(Complex a, Complex b) { return (Complex)(ToBigInteger(a) & ToBigInteger(b)); }
        public override Complex Or(Complex a, Complex b) { return (Complex)(ToBigInteger(a) | ToBigInteger(b)); }
        public override Complex ExclusiveOr(Complex a, Complex b) { return (Complex)(ToBigInteger(a) ^ ToBigInteger(b)); }
        public override Complex OnesComplement(Complex a) { return (Complex)~ToBigInteger(a); }
        public override int Sign(Complex a) { if (a != a.Real) throw new InvalidCastException("not real"); return Math.Sign(a.Real); }
        public override bool IsZero(Complex a) { return a == 0; }
        public override bool IsOne(Complex a) { return a == 1; }
        public override bool IsEven(Complex a) { return ToDouble(a) % 2 == 0; }
        public override bool Equals(Complex x, Complex y) { return x.Equals(y); }
        public override int GetHashCode(Complex obj) { return obj.GetHashCode(); }
        public override int Compare(Complex x, Complex y) { return x.Magnitude.CompareTo(y.Magnitude); }
        public override uint LeastSignificantWord(Complex a) { return (uint)(ToBigInteger(a) & uint.MaxValue); }

        public override Complex Power(Complex a, Complex b) { return Complex.Pow(a, b); }
        public override Complex Root(Complex a, Complex b) { return Complex.Pow(a, 1 / b); }
        public override Complex GreatestCommonDivisor(Complex a, Complex b) { return (Complex)IntegerMath.GreatestCommonDivisor(ToBigInteger(a), ToBigInteger(b)); }
        public override Complex ModularSum(Complex a, Complex b, Complex modulus) { return (Complex)IntegerMath.ModularSum(ToBigInteger(a), ToBigInteger(b), ToBigInteger(modulus)); }
        public override Complex ModularDifference(Complex a, Complex b, Complex modulus) { return (Complex)IntegerMath.ModularDifference(ToBigInteger(a), ToBigInteger(b), ToBigInteger(modulus)); }
        public override Complex ModularProduct(Complex a, Complex b, Complex modulus) { return (Complex)IntegerMath.ModularProduct(ToBigInteger(a), ToBigInteger(b), ToBigInteger(modulus)); }
        public override Complex ModularQuotient(Complex a, Complex b, Complex modulus) { return (Complex)IntegerMath.ModularQuotient(ToBigInteger(a), ToBigInteger(b), ToBigInteger(modulus)); }
        public override Complex ModularPower(Complex value, Complex exponent, Complex modulus) { return (Complex)IntegerMath.ModularPower(ToBigInteger(value), ToBigInteger(exponent), ToBigInteger(modulus)); }
        public override Complex ModularRoot(Complex value, Complex exponent, Complex modulus) { return (Complex)IntegerMath.ModularRoot(ToBigInteger(value), ToBigInteger(exponent), ToBigInteger(modulus)); }
        public override Complex ModularInverse(Complex value, Complex modulus) { return (Complex)IntegerMath.ModularInverse(ToBigInteger(value), ToBigInteger(modulus)); }

        public override Complex AbsoluteValue(Complex a) { return Complex.Abs(a); }
        public override Complex Log(Complex a) { return Complex.Log(a); }
        public override Complex Factorial(Complex a) { return IntegerMath.Factorial(ToInt32(a)); }
    }
}
