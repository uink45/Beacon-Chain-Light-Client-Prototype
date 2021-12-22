using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public struct Rational : IComparable<Rational>, IEquatable<Rational>
    {
        private BigInteger n;
        private BigInteger d;
        public bool IsInteger { get { return d.IsOne; } }
        public BigInteger Numerator { get { return n; } }
        public BigInteger Denominator { get { return d; } }
        public Rational(BigInteger value)
        {
            this.n = value;
            this.d = BigInteger.One;
        }
        public Rational(BigInteger n, BigInteger d)
        {
            if (d == 0)
                throw new DivideByZeroException();
            if (d < 0)
            {
                n = -n;
                d = -d;
            }
            var gcd = BigInteger.GreatestCommonDivisor(n, d);
            if (!n.IsOne)
            {
                n /= gcd;
                d /= gcd;
            }
            this.n = n;
            this.d = d;
        }
        public static Rational operator +(Rational a, Rational b) { return new Rational(a.n * b.d + b.n * a.d, a.d * b.d); }
        public static Rational operator -(Rational a, Rational b) { return new Rational(a.n * b.d - b.n * a.d, a.d * b.d); }
        public static Rational operator *(Rational a, Rational b) { return new Rational(a.n * b.n, a.d * b.d); }
        public static Rational operator /(Rational a, Rational b) { return new Rational(a.n * b.d, a.d * b.n); }
        public static Rational operator +(Rational a) { return a; }
        public static Rational operator -(Rational a) { return new Rational(-a.n, a.d); }
        public static Rational operator ++(Rational a) { return new Rational(a.n + a.d, a.d); }
        public static Rational operator --(Rational a) { return new Rational(a.n - a.d, a.d); }
        public static bool operator ==(Rational a, Rational b) { return a.Equals(b); }
        public static bool operator !=(Rational a, Rational b) { return !a.Equals(b); }
        public static bool operator <(Rational a, Rational b) { return a.CompareTo(b) < 0; }
        public static bool operator <=(Rational a, Rational b) { return a.CompareTo(b) <= 0; }
        public static bool operator >(Rational a, Rational b) { return a.CompareTo(b) > 0; }
        public static bool operator >=(Rational a, Rational b) { return a.CompareTo(b) >= 0; }
        public static implicit operator Rational(int a) { return new Rational(a, 1); }
        public static implicit operator Rational(uint a) { return new Rational(a, 1); }
        public static implicit operator Rational(long a) { return new Rational(a, 1); }
        public static implicit operator Rational(ulong a) { return new Rational(a, 1); }
        public static explicit operator Rational(double a) { return new Rational((BigInteger)a, 1); }
        public static implicit operator Rational(BigInteger a) { return new Rational(a, 1); }
        public static explicit operator BigInteger(Rational a) { if (a.d != 1) throw new InvalidCastException(); return a.n; }
        public static explicit operator int(Rational a) { if (a.d != 1) throw new InvalidCastException(); return (int)a.n; }
        public static explicit operator uint(Rational a) { if (a.d != 1) throw new InvalidCastException(); return (uint)a.n; }
        public static explicit operator long(Rational a) { if (a.d != 1) throw new InvalidCastException(); return (long)a.n; }
        public static explicit operator ulong(Rational a) { if (a.d != 1) throw new InvalidCastException(); return (ulong)a.n; }
        public static explicit operator double(Rational a) { return (double)a.n / (double)a.d; }
        public static explicit operator Complex(Rational a) { return (Complex)((double)a.n / (double)a.d); }
        public static BigInteger Truncate(Rational a) { return a.n / a.d; }
        public static BigInteger Floor(Rational a) { return a.n >= 0 ? a.n / a.d : (a.n - a.d + 1) / a.d; }
        public static BigInteger Ceiling(Rational a) { return a.n >= 0 ? (a.n + a.d - 1) / a.d : a.n / a.d; }
        public static Rational Mediant(Rational a, Rational b) { return new Rational(a.n + b.n, a.d + b.d); }
        public static double Log(Rational a) { return BigInteger.Log(a.n) - BigInteger.Log(a.d); }
        public static double Log(Rational a, double b) { return BigInteger.Log(a.n, b) - BigInteger.Log(a.d, b); }
        public static Rational Abs(Rational a) { return a.n.Sign == -1 ? new Rational(-a.n, a.d) : a; }
        public bool Equals(Rational a) { return n == a.n && d == a.d; }
        public int CompareTo(Rational a) { return (n * a.d).CompareTo(a.n * d); }
        public override bool Equals(object obj) { return obj is Rational && Equals((Rational)obj); }
        public override int GetHashCode() { return n.GetHashCode() ^ d.GetHashCode(); }
        public override string ToString() { return d.IsOne ? n.ToString() : string.Format("{0}/{1}", n, d); }
        public static bool TryParse(string value, out Rational result)
        {
            result = default(Rational);
            if (!value.Contains('/'))
            {
                BigInteger integer;
                if (BigInteger.TryParse(value, out integer))
                {
                    result = new Rational(integer);
                    return true;
                }
                return false;
            }
            var fields = value.Split('/');
            BigInteger numerator;
            BigInteger denominator;
            if (BigInteger.TryParse(fields[0], out numerator) && BigInteger.TryParse(fields[1], out denominator))
            {
                result = new Rational(numerator, denominator);
                return true;
            }
            return false;
        }
        public static Rational Parse(string value)
        {
            Rational result;
            if (TryParse(value, out result))
                return result;
            throw new FormatException("invalid rational");
        }
    }
}
