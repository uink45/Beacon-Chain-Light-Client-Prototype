using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    /// <summary>
    /// An Int65 is a "signed" UInt64, i.e. a ulong plus a sign bit.
    /// </summary>
    public struct Int65
    {
        private int sign;
        private ulong value;

        public static Int65 MinValue { get { return -MaxValue; } }
        public static Int65 MaxValue { get { return ulong.MaxValue; } }

        public int Sign
        {
            get { return value == 0 ? 0 : sign; }
        }

        public bool IsZero
        {
            get { return value == 0; }
        }

        public static implicit operator Int65(int value)
        {
            var c = default(Int65);
            if (value < 0)
            {
                c.value = (ulong)-value;
                c.sign = -1;
            }
            else
            {
                c.value = (ulong)value;
                c.sign = 1;
            }
            return c;
        }

        public static implicit operator Int65(uint value)
        {
            var c = default(Int65);
            c.value = value;
            c.sign = 1;
            return c;
        }

        public static implicit operator Int65(long value)
        {
            var c = default(Int65);
            if (value < 0)
            {
                c.value = (ulong)-value;
                c.sign = -1;
            }
            else
            {
                c.value = (ulong)value;
                c.sign = 1;
            }
            return c;
        }

        public static implicit operator Int65(ulong value)
        {
            var c = default(Int65);
            c.value = value;
            c.sign = 1;
            return c;
        }

        public static implicit operator BigInteger(Int65 value)
        {
            return value.sign == 1 ? (BigInteger)value.value : -(BigInteger)value.value;
        }

        public static explicit operator ulong(Int65 value)
        {
            return value.value;
        }

        public static Int65 operator -(Int65 a)
        {
            var c = default(Int65);
            c.value = a.value;
            c.sign = -a.sign;
            return c;
        }

        public static Int65 operator *(Int65 a, Int65 b)
        {
            var c = default(Int65);
            c.value = a.value * b.value;
            c.sign = a.sign == b.sign ? 1 : -1;
            return c;
        }

        public static Int65 operator *(ulong a, Int65 b)
        {
            var c = default(Int65);
            c.value = a * b.value;
            c.sign = b.sign;
            return c;
        }

        public static Int65 operator +(Int65 a, Int65 b)
        {
            var c = default(Int65);
            c.SetSum(ref a, ref b);
            return c;
        }

        public static Int65 operator -(Int65 a, Int65 b)
        {
            var c = default(Int65);
            c.SetDifference(ref a, ref b);
            return c;
        }

        public void Set(ref Int65 a)
        {
            value = a.value;
            sign = a.sign;
        }

        public void SetSum(ref Int65 a, ref Int65 b)
        {
            if (a.sign == b.sign)
            {
                value = a.value + b.value;
                sign = a.sign;
            }
            else
            {
                if (a.value >= b.value)
                {
                    value = a.value - b.value;
                    sign = a.sign;
                }
                else
                {
                    value = b.value - a.value;
                    sign = -a.sign;
                }
            }
        }

        public void SetDifference(ref Int65 a, ref Int65 b)
        {
            if (a.sign == b.sign)
            {
                if (a.value >= b.value)
                {
                    value = a.value - b.value;
                    sign = a.sign;
                }
                else
                {
                    value = b.value - a.value;
                    sign = -a.sign;
                }
            }
            else
            {
                value = a.value + b.value;
                sign = a.sign;
            }
        }

        public void Multiply(ulong b)
        {
            value *= b;
        }

        public void Swap(ref Int65 a)
        {
            var avalue = a.value;
            var asign = a.sign;
            a.value = value;
            a.sign = sign;
            value = avalue;
            sign = asign;
        }

        public override string ToString()
        {
            return value == 0 || sign == 1 ? value.ToString() : "-" + value.ToString();
        }
    }
}
