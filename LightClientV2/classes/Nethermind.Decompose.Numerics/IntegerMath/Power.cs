using System;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        public static int Square(int a)
        {
            return a * a;
        }

        public static uint Square(uint a)
        {
            return a * a;
        }

        public static long Square(long a)
        {
            return a * a;
        }

        public static ulong Square(ulong a)
        {
            return a * a;
        }

        public static Int128 Square(Int128 a)
        {
            return Int128.Square(a);
        }

        public static UInt128 Square(UInt128 a)
        {
            return UInt128.Square(a);
        }

        public static BigInteger Square(BigInteger a)
        {
            return a * a;
        }

        public static Rational Square(Rational a)
        {
            return a * a;
        }

        public static int Cube(int a)
        {
            return a * a * a;
        }

        public static uint Cube(uint a)
        {
            return a * a * a;
        }

        public static long Cube(long a)
        {
            return a * a * a;
        }

        public static ulong Cube(ulong a)
        {
            return a * a * a;
        }

        public static UInt128 Cube(UInt128 a)
        {
            return a * a * a;
        }

        public static BigInteger Cube(BigInteger a)
        {
            return a * a * a;
        }

        public static Rational Cube(Rational a)
        {
            return a * a * a;
        }

        public static int Power(int value, int exponent)
        {
            var result = (int)1;
            while (exponent != 0)
            {
                if ((exponent & 1) != 0)
                    result = result * value;
                if (exponent != 1)
                    value = value * value;
                exponent >>= 1;
            }
            return result;
        }

        public static uint Power(uint value, uint exponent)
        {
            var result = (uint)1;
            while (exponent != 0)
            {
                if ((exponent & 1) != 0)
                    result = result * value;
                if (exponent != 1)
                    value = value * value;
                exponent >>= 1;
            }
            return result;
        }

        public static long Power(long value, long exponent)
        {
            var result = (long)1;
            while (exponent != 0)
            {
                if ((exponent & 1) != 0)
                    result = result * value;
                if (exponent != 1)
                    value = value * value;
                exponent >>= 1;
            }
            return result;
        }

        public static ulong Power(ulong value, ulong exponent)
        {
            var result = (ulong)1;
            while (exponent != 0)
            {
                if ((exponent & 1) != 0)
                    result = result * value;
                if (exponent != 1)
                    value = value * value;
                exponent >>= 1;
            }
            return result;
        }

        public static UInt128 Power(UInt128 value, UInt128 exponent)
        {
            UInt128 result;
            UInt128.Pow(out result, ref value, (uint)exponent);
            return result;
        }

        public static Int128 Power(Int128 value, Int128 exponent)
        {
            Int128 result;
            Int128.Pow(out result, ref value, (int)exponent);
            return result;
        }

        public static BigInteger Power(BigInteger value, BigInteger exponent)
        {
            if (exponent <= int.MaxValue)
                return BigInteger.Pow(value, (int)exponent);
            var result = (BigInteger)1;
            while (exponent != 0)
            {
                if ((exponent & 1) != 0)
                    result = result * value;
                if (exponent != 1)
                    value = value * value;
                exponent >>= 1;
            }
            return result;
        }

        public static BigInteger Power(BigInteger value, Rational exponent)
        {
            if (exponent.IsInteger)
                return Power(value, (BigInteger)exponent);
            return Power(Root(value, exponent.Denominator), exponent.Numerator);
        }

        public static Rational Power(Rational value, Rational exponent)
        {
            if (value.IsInteger)
                return Power((BigInteger)value, exponent);
            return new Rational(Power(value.Numerator, exponent), Power(value.Denominator, exponent));
        }

        public static long FloorPower(long value, long numerator, long denominator)
        {
            if (denominator == 1)
                return Power(value, numerator);
            return FloorRoot(Power(value, numerator), denominator);
        }

        public static long CeilingPower(long value, long numerator, long denominator)
        {
            if (denominator == 1)
                return Power(value, numerator);
            return CeilingRoot(Power(value, numerator), denominator);
        }

        public static long FloorPower(long value, Rational exponent)
        {
            return FloorPower(value, (long)exponent.Numerator, (long)exponent.Denominator);
        }

        public static long CeilingPower(long value, Rational exponent)
        {
            return CeilingPower(value, (long)exponent.Numerator, (long)exponent.Denominator);
        }

        public static BigInteger FloorPower(BigInteger value, BigInteger numerator, BigInteger denominator)
        {
            if (denominator.IsOne)
                return Power(value, numerator);
            return FloorRoot(Power(value, numerator), denominator);
        }

        public static BigInteger CeilingPower(BigInteger value, BigInteger numerator, BigInteger denominator)
        {
            if (denominator.IsOne)
                return Power(value, numerator);
            return CeilingRoot(Power(value, numerator), denominator);
        }

        public static BigInteger FloorPower(BigInteger value, Rational exponent)
        {
            return FloorPower(value, exponent.Numerator, exponent.Denominator);
        }

        public static BigInteger CeilingPower(BigInteger value, Rational exponent)
        {
            return CeilingPower(value, exponent.Numerator, exponent.Denominator);
        }
    }
}
