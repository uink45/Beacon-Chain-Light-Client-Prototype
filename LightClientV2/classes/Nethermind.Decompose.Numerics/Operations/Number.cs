using System;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public struct Number<T> : IComparable, IComparable<Number<T>>, IEquatable<Number<T>>
    {
        private static Operations<T> ops = Operations.Get<T>();
        private static Number<T> minValue = ops.MinValue;
        private static Number<T> maxValue = ops.MaxValue;
        private static Number<T> zero = ops.Zero;
        private static Number<T> one = ops.One;

        private T value;
        public Number(T value) { this.value = value; }
        public T Value { get { return value; } }
        public static Number<T> MinValue { get { return minValue; } }
        public static Number<T> MaxValue { get { return maxValue; } }
        public static Number<T> Zero { get { return zero; } }
        public static Number<T> One { get { return one; } }
        public bool IsZero { get { return ops.IsZero(value); } }
        public bool IsOne { get { return ops.IsOne(value); } }
        public bool IsEven { get { return ops.IsEven(value); } }
        public int Sign { get { return ops.Sign(value); } }
        public static implicit operator Number<T>(int value) { return new Number<T>(ops.Convert(value)); }
        public static explicit operator Number<T>(BigInteger value) { return new Number<T>(ops.Convert(value)); }
        public static implicit operator Number<T>(double value) { return new Number<T>(ops.Convert(value)); }
        public static implicit operator Number<T>(T value) { return new Number<T>(value); }
        public static implicit operator T(Number<T> integer) { return integer.value; }
        public static explicit operator int(Number<T> integer) { return ops.ToInt32(integer.value); }
        public static implicit operator BigInteger(Number<T> integer) { return ops.ToBigInteger(integer.value); }
        public static explicit operator double(Number<T> integer) { return ops.ToDouble(integer.value); }
        public static Number<T> operator +(Number<T> a, Number<T> b) { return new Number<T>(ops.Add(a.value, b.value)); }
        public static Number<T> operator +(T a, Number<T> b) { return new Number<T>(ops.Add(a, b.value)); }
        public static Number<T> operator +(Number<T> a, T b) { return new Number<T>(ops.Add(a.value, b)); }
        public static Number<T> operator -(Number<T> a, Number<T> b) { return new Number<T>(ops.Subtract(a.value, b.value)); }
        public static Number<T> operator -(T a, Number<T> b) { return new Number<T>(ops.Subtract(a, b.value)); }
        public static Number<T> operator -(Number<T> a, T b) { return new Number<T>(ops.Subtract(a.value, b)); }
        public static Number<T> operator *(Number<T> a, Number<T> b) { return new Number<T>(ops.Multiply(a.value, b.value)); }
        public static Number<T> operator *(T a, Number<T> b) { return new Number<T>(ops.Multiply(a, b.value)); }
        public static Number<T> operator *(Number<T> a, T b) { return new Number<T>(ops.Multiply(a.value, b)); }
        public static Number<T> operator /(Number<T> a, Number<T> b) { return new Number<T>(ops.Divide(a.value, b.value)); }
        public static Number<T> operator /(T a, Number<T> b) { return new Number<T>(ops.Divide(a, b.value)); }
        public static Number<T> operator /(Number<T> a, T b) { return new Number<T>(ops.Divide(a.value, b)); }
        public static Number<T> operator %(Number<T> a, Number<T> b) { return new Number<T>(ops.Remainder(a.value, b.value)); }
        public static Number<T> operator %(T a, Number<T> b) { return new Number<T>(ops.Remainder(a, b.value)); }
        public static Number<T> operator %(Number<T> a, T b) { return new Number<T>(ops.Remainder(a.value, b)); }
        public static Number<T> operator +(Number<T> a) { return a; }
        public static Number<T> operator -(Number<T> a) { return new Number<T>(ops.Negate(a.value)); }
        public static Number<T> operator ++(Number<T> a) { return new Number<T>(ops.Add(a.value, one.value)); }
        public static Number<T> operator --(Number<T> a) { return new Number<T>(ops.Subtract(a.value, one.value)); }
        public static Number<T> operator <<(Number<T> a, int b) { return new Number<T>(ops.LeftShift(a.value, b)); }
        public static Number<T> operator >>(Number<T> a, int b) { return new Number<T>(ops.RightShift(a.value, b)); }
        public static Number<T> operator &(Number<T> a, Number<T> b) { return new Number<T>(ops.And(a.value, b.value)); }
        public static Number<T> operator &(T a, Number<T> b) { return new Number<T>(ops.And(a, b.value)); }
        public static Number<T> operator &(Number<T> a, T b) { return new Number<T>(ops.And(a.value, b)); }
        public static Number<T> operator |(Number<T> a, Number<T> b) { return new Number<T>(ops.Or(a.value, b.value)); }
        public static Number<T> operator |(T a, Number<T> b) { return new Number<T>(ops.Or(a, b.value)); }
        public static Number<T> operator |(Number<T> a, T b) { return new Number<T>(ops.Or(a.value, b)); }
        public static Number<T> operator ^(Number<T> a, Number<T> b) { return new Number<T>(ops.ExclusiveOr(a.value, b.value)); }
        public static Number<T> operator ^(T a, Number<T> b) { return new Number<T>(ops.ExclusiveOr(a, b.value)); }
        public static Number<T> operator ^(Number<T> a, T b) { return new Number<T>(ops.ExclusiveOr(a.value, b)); }
        public static Number<T> operator ~(Number<T> a) { return new Number<T>(ops.OnesComplement(a.value)); }
        public static bool operator ==(Number<T> a, Number<T> b) { return ops.Equals(a.value, b.value); }
        public static bool operator ==(T a, Number<T> b) { return ops.Equals(a, b.value); }
        public static bool operator ==(Number<T> a, T b) { return ops.Equals(a.value, b); }
        public static bool operator !=(Number<T> a, Number<T> b) { return !ops.Equals(a.value, b.value); }
        public static bool operator !=(T a, Number<T> b) { return !ops.Equals(a, b.value); }
        public static bool operator !=(Number<T> a, T b) { return !ops.Equals(a.value, b); }
        public static bool operator <(Number<T> a, Number<T> b) { return ops.Compare(a.value, b.value) < 0; }
        public static bool operator <(T a, Number<T> b) { return ops.Compare(a, b.value) < 0; }
        public static bool operator <(Number<T> a, T b) { return ops.Compare(a.value, b) < 0; }
        public static bool operator <=(Number<T> a, Number<T> b) { return ops.Compare(a.value, b.value) <= 0; }
        public static bool operator <=(T a, Number<T> b) { return ops.Compare(a, b.value) <= 0; }
        public static bool operator <=(Number<T> a, T b) { return ops.Compare(a.value, b) <= 0; }
        public static bool operator >(Number<T> a, Number<T> b) { return ops.Compare(a.value, b.value) > 0; }
        public static bool operator >(T a, Number<T> b) { return ops.Compare(a, b.value) > 0; }
        public static bool operator >(Number<T> a, T b) { return ops.Compare(a.value, b) > 0; }
        public static bool operator >=(Number<T> a, Number<T> b) { return ops.Compare(a.value, b.value) >= 0; }
        public static bool operator >=(T a, Number<T> b) { return ops.Compare(a, b.value) >= 0; }
        public static bool operator >=(Number<T> a, T b) { return ops.Compare(a.value, b) >= 0; }
        public static Number<T> Power(Number<T> a, Number<T> b) { return new Number<T>(ops.Power(a.value, b.value)); }
        public static Number<T> Root(Number<T> a, Number<T> b) { return new Number<T>(ops.Root(a.value, b.value)); }
        public static Number<T> FloorRoot(Number<T> a, Number<T> b) { return new Number<T>(ops.Convert(Math.Floor(Math.Exp(BigInteger.Log(a) / ops.ToDouble(b))))); }
        public static Number<T> SquareRoot(Number<T> a) { return new Number<T>(ops.Root(a.value, ops.Convert(2))); }
        public static Number<T> GreatestCommonDivisor(Number<T> a, Number<T> b) { return new Number<T>(ops.GreatestCommonDivisor(a.value, b.value)); }
        public static Number<T> ModularSum(Number<T> a, Number<T> b, Number<T> modulus) { return new Number<T>(ops.ModularSum(a.value, b.value, modulus.value)); }
        public static Number<T> ModularDifference(Number<T> a, Number<T> b, Number<T> modulus) { return new Number<T>(ops.ModularDifference(a.value, b.value, modulus.value)); }
        public static Number<T> ModularProduct(Number<T> a, Number<T> b, Number<T> modulus) { return new Number<T>(ops.ModularProduct(a.value, b.value, modulus.value)); }
        public static Number<T> ModularPower(Number<T> a, Number<T> exponent, Number<T> modulus) { return new Number<T>(ops.ModularPower(a.value, exponent.value, modulus.value)); }
        public static Number<T> ModularInverse(Number<T> a, Number<T> modulus) { return new Number<T>(ops.ModularInverse(a.value, modulus.value)); }
        public int CompareTo(object obj) { if (obj is Number<T>) return ops.Compare(value, ((Number<T>)obj).value); throw new ArgumentException("obj"); }
        public int CompareTo(T other) { return ops.Compare(value, other); }
        public int CompareTo(Number<T> other) { return ops.Compare(value, other.value); }
        public bool Equals(T other) { return ops.Equals(value, other); }
        public bool Equals(Number<T> other) { return ops.Equals(value, other.value); }
        public static Number<T> Min(Number<T> a, Number<T> b) { return ops.Compare(a.value, b.value) < 0 ? a : b; }
        public static Number<T> Max(Number<T> a, Number<T> b) { return ops.Compare(a.value, b.value) > 0 ? a : b; }
        public static Number<T> Abs(Number<T> a) { return ops.AbsoluteValue(a); }
        public static Complex Log(Number<T> a) { return ops.Log(a.value); }
        public static Complex Log(Number<T> a, double b) { return ops.Log(a.value) / Math.Log(b); }
        public override bool Equals(object obj) { return obj is Number<T> && ops.Equals(value, ((Number<T>)obj).value); }
        public override int GetHashCode() { return value.GetHashCode(); }
        public override string ToString() { return value.ToString(); }
    }
}
