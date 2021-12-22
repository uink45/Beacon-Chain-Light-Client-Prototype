using System;
using System.Buffers.Binary;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Numerics;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

namespace Nethermind.Dirichlet.Numerics
{
    /// <summary>
    /// A 128 bit unsigned integer data type.
    /// </summary>
    /// <remarks>
    /// UInt128 is a value type that provides a complete managed-only implementation of 128
    /// unsigned arithmetic, the next size up in the series of types UInt16, UInt32, UInt64.
    /// UInt128 is considerably faster, typically between two and twenty times faster, than
    /// BigInteger for 128 bit operands.  Furthermore, UInt128 is a pure value type whose
    /// core operations never allocate heap memory and are therefore particularly suitable for
    /// highly parallel algorithms.  Additional methods are provided to support integer square
    /// and cube roots as well as all modular arithmetic operations and all methods are optimized
    /// for speed.  The checked or unchecked context has no effect on UInt128 but conversions
    /// act as though they were performed in an unchecked context.
    /// </remarks>
    public struct UInt256 : IFormattable, IComparable, IComparable<UInt256>, IEquatable<UInt256>
    {
        private struct UInt512
        {
            public ulong s0;
            public ulong s1;
            public ulong s2;
            public ulong s3;
            public ulong s4;
            public ulong s5;
            public ulong s6;
            public ulong s7;

            public uint r0 => (uint) s0;
            public uint r1 => (uint) (s0 >> 32);
            public uint r2 => (uint) s1;
            public uint r3 => (uint) (s1 >> 32);
            public uint r4 => (uint) s2;
            public uint r5 => (uint) (s2 >> 32);
            public uint r6 => (uint) s3;
            public uint r7 => (uint) (s3 >> 32);
            public uint r8 => (uint) s4;
            public uint r9 => (uint) (s4 >> 32);
            public uint r10 => (uint) s5;
            public uint r11 => (uint) (s5 >> 32);
            public uint r12 => (uint) s6;
            public uint r13 => (uint) (s6 >> 32);
            public uint r14 => (uint) s7;
            public uint r15 => (uint) (s7 >> 32);

            public UInt128 t0
            {
                get
                {
                    UInt128.Create(out UInt128 result, s0, s1);
                    return result;
                }
            }

            public UInt128 t1
            {
                get
                {
                    UInt128.Create(out UInt128 result, s2, s3);
                    return result;
                }
            }

            public UInt128 t2
            {
                get
                {
                    UInt128.Create(out UInt128 result, s4, s5);
                    return result;
                }
            }

            public UInt128 t3
            {
                get
                {
                    UInt128.Create(out UInt128 result, s6, s7);
                    return result;
                }
            }

            public UInt256 u0
            {
                get
                {
                    Create(out UInt256 result, t0, t1);
                    return result;
                }
            }

            public UInt256 u1
            {
                get
                {
                    Create(out UInt256 result, t2, t3);
                    return result;
                }
            }

            public static implicit operator BigInteger(UInt512 a)
            {
                return
                    (BigInteger) a.s7 << 448 |
                    (BigInteger) a.s6 << 384 |
                    (BigInteger) a.s5 << 320 |
                    (BigInteger) a.s4 << 256 |
                    (BigInteger) a.s3 << 192 |
                    (BigInteger) a.s2 << 128 |
                    (BigInteger) a.s1 << 64 |
                    a.s0;
            }

            public override string ToString()
            {
                return ((BigInteger) this).ToString();
            }
        }

        private ulong s0;
        private ulong s1;
        private ulong s2;
        private ulong s3;

        public UInt128 t0
        {
            get
            {
                UInt128.Create(out UInt128 result, s0, s1);
                return result;
            }
        }

        public UInt128 t1
        {
            get
            {
                UInt128.Create(out UInt128 result, s2, s3);
                return result;
            }
        }

        private static readonly UInt256 maxValue = ~(UInt256) 0;
        private static readonly UInt256 zero = (UInt256) 0;
        private static readonly UInt256 one = (UInt256) 1;

        public static UInt256 MinValue => zero;
        public static UInt256 MaxValue => maxValue;
        public static UInt256 Zero => zero;
        public static UInt256 One => one;

        public static UInt256 Parse(string value)
        {
            if (!TryParse(value, out UInt256 c))
                throw new FormatException();
            return c;
        }

        public static UInt256 Parse(ReadOnlySpan<char> value, NumberStyles numberStyles)
        {
            if (!TryParse(value, numberStyles, CultureInfo.InvariantCulture, out UInt256 c))
                throw new FormatException();
            return c;
        }

        public static bool TryParse(string value, out UInt256 result)
        {
            return TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out result);
        }

        public static bool TryParse(ReadOnlySpan<char> value, out UInt256 result)
        {
            return TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out result);
        }

        public static bool TryParse(string value, NumberStyles style, IFormatProvider provider, out UInt256 result)
        {
            return TryParse(value.AsSpan(), style, provider, out result);
        }

        public static bool TryParse(ReadOnlySpan<char> value, NumberStyles style, IFormatProvider provider, out UInt256 result)
        {
            BigInteger a;
            bool bigParsedProperly;
            if ((style & NumberStyles.HexNumber) == NumberStyles.HexNumber && value[0] != 0)
            {
                Span<char> fixedHexValue = stackalloc char[value.Length + 1];
                fixedHexValue[0] = '0';
                value.CopyTo(fixedHexValue.Slice(1));
                bigParsedProperly = BigInteger.TryParse(fixedHexValue, style, provider, out a);
            }
            else
            {
                Span<char> fixedHexValue = stackalloc char[value.Length];
                value.CopyTo(fixedHexValue);
                bigParsedProperly = BigInteger.TryParse(fixedHexValue, style, provider, out a);
            }

            if (!bigParsedProperly)
            {
                result = Zero;
                return false;
            }

            Create(out result, a);
            return true;
        }

        public UInt256(long value)
        {
            Create(out this, value);
        }

        public UInt256(ulong value)
        {
            Create(out this, value);
        }

        public UInt256(ulong s0, ulong s1, ulong s2, ulong s3)
        {
            Create(out this, s0, s1, s2, s3);
        }

        public UInt256(decimal value)
        {
            Create(out this, value);
        }

        public UInt256(double value)
        {
            Create(out this, value);
        }

        public UInt256(BigInteger value)
        {
            Create(out this, value);
        }

        public void ToBigEndian(Span<byte> target)
        {
            if (target.Length == 32)
            {
                BinaryPrimitives.WriteUInt64BigEndian(target.Slice(0, 8), s3);
                BinaryPrimitives.WriteUInt64BigEndian(target.Slice(8, 8), s2);
                BinaryPrimitives.WriteUInt64BigEndian(target.Slice(16, 8), s1);
                BinaryPrimitives.WriteUInt64BigEndian(target.Slice(24, 8), s0);
            }
            else if (target.Length == 20)
            {
                BinaryPrimitives.WriteUInt32BigEndian(target.Slice(0, 4), (uint) s2);
                BinaryPrimitives.WriteUInt64BigEndian(target.Slice(4, 8), s1);
                BinaryPrimitives.WriteUInt64BigEndian(target.Slice(12, 8), s0);
            }
        }

        public void ToLittleEndian(Span<byte> target)
        {
            BinaryPrimitives.WriteUInt64LittleEndian(target.Slice(0, 8), s0);
            BinaryPrimitives.WriteUInt64LittleEndian(target.Slice(8, 8), s1);
            BinaryPrimitives.WriteUInt64LittleEndian(target.Slice(16, 8), s2);
            BinaryPrimitives.WriteUInt64LittleEndian(target.Slice(24, 8), s3);
        }

        public static void CreateFromLittleEndian(out UInt256 c, Span<byte> span)
        {
            Span<ulong> ulongs = MemoryMarshal.Cast<byte, ulong>(span);
            if (ulongs.Length == 4)
            {
                c.s0 = ulongs[0];
                c.s1 = ulongs[1];
                c.s2 = ulongs[2];
                c.s3 = ulongs[3];
            }
            else
            {
                throw new NotSupportedException();
            }
        }

        public static void CreateFromBigEndian(out UInt256 c, ReadOnlySpan<byte> span)
        {
            ReadOnlySpan<ulong> ulongs = MemoryMarshal.Cast<byte, ulong>(span);
            if (ulongs.Length == 4)
            {
                c.s0 = BinaryPrimitives.ReverseEndianness(ulongs[3]);
                c.s1 = BinaryPrimitives.ReverseEndianness(ulongs[2]);
                c.s2 = BinaryPrimitives.ReverseEndianness(ulongs[1]);
                c.s3 = BinaryPrimitives.ReverseEndianness(ulongs[0]);
            }
            else
            {
                CreateFromBigEndian2(out c, span);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static void CreateFromBigEndian2(out UInt256 c, ReadOnlySpan<byte> span)
        {
            int byteCount = span.Length;
            int unalignedBytes = byteCount % 8;
            int dwordCount = byteCount / 8 + (unalignedBytes == 0 ? 0 : 1);

            c.s0 = 0;
            c.s1 = 0;
            c.s2 = 0;
            c.s3 = 0;

            if (dwordCount == 0)
            {
                return;
            }

            if (dwordCount >= 1)
            {
                for (int j = 8; j > 0; j--)
                {
                    c.s0 = c.s0 << 8;
                    if (j <= byteCount)
                    {
                        c.s0 = c.s0 | span[byteCount - j];
                    }
                }
            }

            if (dwordCount >= 2)
            {
                for (int j = 16; j > 8; j--)
                {
                    c.s1 = c.s1 << 8;
                    if (j <= byteCount)
                    {
                        c.s1 = c.s1 | span[byteCount - j];
                    }
                }
            }

            if (dwordCount >= 3)
            {
                for (int j = 24; j > 16; j--)
                {
                    c.s2 = c.s2 << 8;
                    if (j <= byteCount)
                    {
                        c.s2 = c.s2 | span[byteCount - j];
                    }
                }
            }

            if (dwordCount >= 4)
            {
                for (int j = 32; j > 24; j--)
                {
                    c.s3 = c.s3 << 8;
                    if (j <= byteCount)
                    {
                        c.s3 = c.s3 | span[byteCount - j];
                    }
                }
            }
        }

        public static void Create(out UInt256 c, uint r0, uint r1, uint r2, uint r3, uint r4, uint r5, uint r6, uint r7)
        {
            c.s0 = (ulong) r1 << 32 | r0;
            c.s1 = (ulong) r3 << 32 | r2;
            c.s2 = (ulong) r5 << 32 | r4;
            c.s3 = (ulong) r7 << 32 | r6;
        }

        public static void Create(out UInt256 c, UInt128 t0, UInt128 t1)
        {
            c.s0 = t0.S0;
            c.s1 = t0.S1;
            c.s2 = t1.S0;
            c.s3 = t1.S1;
        }

        public static void Create(out UInt256 c, ulong s0, ulong s1, ulong s2, ulong s3)
        {
            c.s0 = s0;
            c.s1 = s1;
            c.s2 = s2;
            c.s3 = s3;
        }

        public static void Create(out UInt256 c, long a)
        {
            c.s0 = (ulong) a;
            c.s1 = a < 0 ? ulong.MaxValue : 0;
            c.s2 = a < 0 ? ulong.MaxValue : 0;
            c.s3 = a < 0 ? ulong.MaxValue : 0;
        }

        public static void Create(out UInt256 c, ulong a)
        {
            c.s0 = a;
            c.s1 = 0;
            c.s2 = 0;
            c.s3 = 0;
        }

        public static void Create(out UInt256 c, decimal a)
        {
            var bits = decimal.GetBits(decimal.Truncate(a));
            Create(out c, (uint) bits[0], (uint) bits[1], (uint) bits[2], 0, 0, 0, 0, 0);
            if (a < 0)
                Negate(ref c);
        }

        public static void CreateOld(out UInt256 c, BigInteger a)
        {
            var sign = a.Sign;
            if (sign == -1)
                a = -a;
            c.s0 = (ulong) (a & ulong.MaxValue);
            c.s1 = (ulong) ((a >> 64) & ulong.MaxValue);
            c.s2 = (ulong) ((a >> 128) & ulong.MaxValue);
            c.s3 = (ulong) ((a >> 192));
            if (sign == -1)
                Negate(ref c);
        }

        public static void Create(out UInt256 c, BigInteger a)
        {
            if (a.IsZero)
            {
                c = Zero;
            }
            else
            {
                int sign = a.Sign;
                if (sign == -1)
                {
                    a = -a;
                }

                Span<byte> bytes = stackalloc byte[32];
                Span<byte> bytes32 = stackalloc byte[32];
                a.TryWriteBytes(bytes, out int bytesWritten, true, true);
                bytes.Slice(0, bytesWritten).CopyTo(bytes32.Slice(32 - bytesWritten, bytesWritten));

                CreateFromBigEndian(out c, bytes32);
                if (sign == -1)
                    Negate(ref c);
            }
        }

        public static void Create(out UInt256 c, double a)
        {
            var negate = false;
            if (a < 0)
            {
                negate = true;
                a = -a;
            }

            if (a <= ulong.MaxValue)
            {
                c.s0 = (ulong) a;
                c.s1 = 0;
                c.s2 = 0;
                c.s3 = 0;
            }
            else
            {
                var shift = Math.Max((int) Math.Ceiling(Math.Log(a, 2)) - 63, 0);
                c.s0 = (ulong) (a / Math.Pow(2, shift));
                c.s1 = 0;
                c.s2 = 0;
                c.s3 = 0;
                LeftShift(ref c, shift);
            }

            if (negate)
                Negate(ref c);
        }

        private uint r0 => (uint) s0;
        private uint r1 => (uint) (s0 >> 32);
        private uint r2 => (uint) s1;
        private uint r3 => (uint) (s1 >> 32);
        private uint r4 => (uint) s2;
        private uint r5 => (uint) (s2 >> 32);
        private uint r6 => (uint) s3;
        private uint r7 => (uint) (s3 >> 32);

        public ulong S0 => s0;
        public ulong S1 => s1;
        public ulong S2 => s2;
        public ulong S3 => s3;

        public bool IsZero => (s0 | s1 | s2 | s3) == 0;
        public bool IsOne => s0 == 1 && s1 == 0 && s2 == 0 && s3 == 0;
        public bool IsPowerOfTwo => (this & (this - 1)).IsZero;
        public bool IsEven => (s0 & 1) == 0;
        public bool IsOdd => !IsEven;
        public int Sign => IsZero ? 0 : 1;

        public override string ToString()
        {
            return ((BigInteger) this).ToString();
        }

        public string ToString(string format)
        {
            return ((BigInteger) this).ToString(format);
        }

        public string ToString(IFormatProvider provider)
        {
            return ToString(null, provider);
        }

        public string ToString(string format, IFormatProvider provider)
        {
            return ((BigInteger) this).ToString(format, provider);
        }

        public static explicit operator UInt256(double a)
        {
            Create(out UInt256 c, a);
            return c;
        }

        public static explicit operator UInt256(sbyte a)
        {
            Create(out UInt256 c, a);
            return c;
        }

        public static implicit operator UInt256(byte a)
        {
            Create(out UInt256 c, a);
            return c;
        }

        public static explicit operator UInt256(short a)
        {
            Create(out UInt256 c, a);
            return c;
        }

        public static implicit operator UInt256(ushort a)
        {
            Create(out UInt256 c, a);
            return c;
        }

        public static explicit operator UInt256(int a)
        {
            Create(out UInt256 c, a);
            return c;
        }

        public static implicit operator UInt256(uint a)
        {
            Create(out UInt256 c, a);
            return c;
        }

        public static explicit operator UInt256(long a)
        {
            Create(out UInt256 c, a);
            return c;
        }

        public static implicit operator UInt256(ulong a)
        {
            Create(out UInt256 c, a);
            return c;
        }

        public static explicit operator UInt256(decimal a)
        {
            Create(out UInt256 c, a);
            return c;
        }

        public static explicit operator UInt256(BigInteger a)
        {
            Create(out UInt256 c, a);
            return c;
        }

        public static explicit operator sbyte(UInt256 a)
        {
            return (sbyte) a.s0;
        }

        public static explicit operator byte(UInt256 a)
        {
            return (byte) a.s0;
        }

        public static explicit operator short(UInt256 a)
        {
            return (short) a.s0;
        }

        public static explicit operator ushort(UInt256 a)
        {
            return (ushort) a.s0;
        }

        public static explicit operator int(UInt256 a)
        {
            return (int) a.s0;
        }

        public static explicit operator uint(UInt256 a)
        {
            return (uint) a.s0;
        }

        public static explicit operator long(UInt256 a)
        {
            return (long) a.s0;
        }

        public static explicit operator ulong(UInt256 a)
        {
            return a.s0;
        }

        public static explicit operator decimal(UInt256 a)
        {
            if (a.s1 == 0)
                return a.s0;
            var shift = Math.Max(0, 32 - GetBitLength(a.s1));
            UInt256 ashift;
            RightShift(out ashift, ref a, shift);
            return new decimal((int) a.r0, (int) a.r1, (int) a.r2, false, (byte) shift);
        }

        public static implicit operator BigInteger(UInt256 a)
        {
            Span<byte> bytes = stackalloc byte[32];
            a.ToBigEndian(bytes);
            BigInteger bigInt = new BigInteger(bytes, true, true);
            return bigInt;
        }

        public static UInt256 operator <<(UInt256 a, int b)
        {
            LeftShift(out UInt256 c, ref a, b);
            return c;
        }

        public static UInt256 operator >>(UInt256 a, int b)
        {
            RightShift(out UInt256 c, ref a, b);
            return c;
        }

        public static UInt256 operator &(UInt256 a, UInt256 b)
        {
            And(out UInt256 c, ref a, ref b);
            return c;
        }

        public static uint operator &(UInt256 a, uint b)
        {
            return (uint) a.s0 & b;
        }

        public static uint operator &(uint a, UInt256 b)
        {
            return a & (uint) b.s0;
        }

        public static ulong operator &(UInt256 a, ulong b)
        {
            return a.s0 & b;
        }

        public static ulong operator &(ulong a, UInt256 b)
        {
            return a & b.s0;
        }

        public static UInt256 operator |(UInt256 a, UInt256 b)
        {
            Or(out UInt256 c, ref a, ref b);
            return c;
        }

        public static UInt256 operator ^(UInt256 a, UInt256 b)
        {
            ExclusiveOr(out UInt256 c, ref a, ref b);
            return c;
        }

        public static UInt256 operator ~(UInt256 a)
        {
            Not(out UInt256 c, ref a);
            return c;
        }

        public static UInt256 operator +(UInt256 a, UInt256 b)
        {
            Add(out UInt256 c, ref a, ref b);
            return c;
        }

        public static UInt256 operator +(UInt256 a, ulong b)
        {
            Add(out UInt256 c, ref a, b);
            return c;
        }

        public static UInt256 operator +(ulong a, UInt256 b)
        {
            Add(out UInt256 c, ref b, a);
            return c;
        }

        public static UInt256 operator ++(UInt256 a)
        {
            Add(out UInt256 c, ref a, 1);
            return c;
        }

        public static UInt256 operator -(UInt256 a, UInt256 b)
        {
            Subtract(out UInt256 c, ref a, ref b);
            return c;
        }

        public static UInt256 operator -(UInt256 a, ulong b)
        {
            Subtract(out UInt256 c, ref a, b);
            return c;
        }

        public static UInt256 operator -(ulong a, UInt256 b)
        {
            Subtract(out UInt256 c, a, ref b);
            return c;
        }

        public static UInt256 operator --(UInt256 a)
        {
            Subtract(out UInt256 c, ref a, 1);
            return c;
        }

        public static UInt256 operator +(UInt256 a)
        {
            return a;
        }

        public static UInt256 operator *(UInt256 a, uint b)
        {
            Multiply(out UInt256 c, ref a, b);
            return c;
        }

        public static UInt256 operator *(uint a, UInt256 b)
        {
            Multiply(out UInt256 c, ref b, a);
            return c;
        }

        public static UInt256 operator *(UInt256 a, ulong b)
        {
            Multiply(out UInt256 c, ref a, b);
            return c;
        }

        public static UInt256 operator *(ulong a, UInt256 b)
        {
            Multiply(out UInt256 c, ref b, a);
            return c;
        }

        public static UInt256 operator *(UInt256 a, UInt256 b)
        {
            Multiply(out UInt256 c, ref a, ref b);
            return c;
        }

        public static UInt256 operator /(UInt256 a, ulong b)
        {
            Divide(out UInt256 c, ref a, b);
            return c;
        }

        public static UInt256 operator /(UInt256 a, UInt256 b)
        {
            Divide(out UInt256 c, ref a, ref b);
            return c;
        }

        public static ulong operator %(UInt256 a, uint b)
        {
            return Remainder(ref a, b);
        }

        public static ulong operator %(UInt256 a, ulong b)
        {
            return Remainder(ref a, b);
        }

        public static UInt256 operator %(UInt256 a, UInt256 b)
        {
            Remainder(out UInt256 c, ref a, ref b);
            return c;
        }

        public static bool operator <(UInt256 a, UInt256 b)
        {
            return LessThan(ref a, ref b);
        }

        public static bool operator <(UInt256 a, int b)
        {
            return LessThan(ref a, b);
        }

        public static bool operator <(int a, UInt256 b)
        {
            return LessThan(a, ref b);
        }

        public static bool operator <(UInt256 a, uint b)
        {
            return LessThan(ref a, b);
        }

        public static bool operator <(uint a, UInt256 b)
        {
            return LessThan(a, ref b);
        }

        public static bool operator <(UInt256 a, long b)
        {
            return LessThan(ref a, b);
        }

        public static bool operator <(long a, UInt256 b)
        {
            return LessThan(a, ref b);
        }

        public static bool operator <(UInt256 a, ulong b)
        {
            return LessThan(ref a, b);
        }

        public static bool operator <(ulong a, UInt256 b)
        {
            return LessThan(a, ref b);
        }

        public static bool operator <=(UInt256 a, UInt256 b)
        {
            return !LessThan(ref b, ref a);
        }

        public static bool operator <=(UInt256 a, int b)
        {
            return !LessThan(b, ref a);
        }

        public static bool operator <=(int a, UInt256 b)
        {
            return !LessThan(ref b, a);
        }

        public static bool operator <=(UInt256 a, uint b)
        {
            return !LessThan(b, ref a);
        }

        public static bool operator <=(uint a, UInt256 b)
        {
            return !LessThan(ref b, a);
        }

        public static bool operator <=(UInt256 a, long b)
        {
            return !LessThan(b, ref a);
        }

        public static bool operator <=(long a, UInt256 b)
        {
            return !LessThan(ref b, a);
        }

        public static bool operator <=(UInt256 a, ulong b)
        {
            return !LessThan(b, ref a);
        }

        public static bool operator <=(ulong a, UInt256 b)
        {
            return !LessThan(ref b, a);
        }

        public static bool operator >(UInt256 a, UInt256 b)
        {
            return LessThan(ref b, ref a);
        }

        public static bool operator >(UInt256 a, int b)
        {
            return LessThan(b, ref a);
        }

        public static bool operator >(int a, UInt256 b)
        {
            return LessThan(ref b, a);
        }

        public static bool operator >(UInt256 a, uint b)
        {
            return LessThan(b, ref a);
        }

        public static bool operator >(uint a, UInt256 b)
        {
            return LessThan(ref b, a);
        }

        public static bool operator >(UInt256 a, long b)
        {
            return LessThan(b, ref a);
        }

        public static bool operator >(long a, UInt256 b)
        {
            return LessThan(ref b, a);
        }

        public static bool operator >(UInt256 a, ulong b)
        {
            return LessThan(b, ref a);
        }

        public static bool operator >(ulong a, UInt256 b)
        {
            return LessThan(ref b, a);
        }

        public static bool operator >=(UInt256 a, UInt256 b)
        {
            return !LessThan(ref a, ref b);
        }

        public static bool operator >=(UInt256 a, int b)
        {
            return !LessThan(ref a, b);
        }

        public static bool operator >=(int a, UInt256 b)
        {
            return !LessThan(a, ref b);
        }

        public static bool operator >=(UInt256 a, uint b)
        {
            return !LessThan(ref a, b);
        }

        public static bool operator >=(uint a, UInt256 b)
        {
            return !LessThan(a, ref b);
        }

        public static bool operator >=(UInt256 a, long b)
        {
            return !LessThan(ref a, b);
        }

        public static bool operator >=(long a, UInt256 b)
        {
            return !LessThan(a, ref b);
        }

        public static bool operator >=(UInt256 a, ulong b)
        {
            return !LessThan(ref a, b);
        }

        public static bool operator >=(ulong a, UInt256 b)
        {
            return !LessThan(a, ref b);
        }

        public static bool operator ==(UInt256 a, UInt256 b)
        {
            return a.Equals(b);
        }

        public static bool operator ==(UInt256 a, int b)
        {
            return a.Equals(b);
        }

        public static bool operator ==(int a, UInt256 b)
        {
            return b.Equals(a);
        }

        public static bool operator ==(UInt256 a, uint b)
        {
            return a.Equals(b);
        }

        public static bool operator ==(uint a, UInt256 b)
        {
            return b.Equals(a);
        }

        public static bool operator ==(UInt256 a, long b)
        {
            return a.Equals(b);
        }

        public static bool operator ==(long a, UInt256 b)
        {
            return b.Equals(a);
        }

        public static bool operator ==(UInt256 a, ulong b)
        {
            return a.Equals(b);
        }

        public static bool operator ==(ulong a, UInt256 b)
        {
            return b.Equals(a);
        }

        public static bool operator !=(UInt256 a, UInt256 b)
        {
            return !a.Equals(b);
        }

        public static bool operator !=(UInt256 a, int b)
        {
            return !a.Equals(b);
        }

        public static bool operator !=(int a, UInt256 b)
        {
            return !b.Equals(a);
        }

        public static bool operator !=(UInt256 a, uint b)
        {
            return !a.Equals(b);
        }

        public static bool operator !=(uint a, UInt256 b)
        {
            return !b.Equals(a);
        }

        public static bool operator !=(UInt256 a, long b)
        {
            return !a.Equals(b);
        }

        public static bool operator !=(long a, UInt256 b)
        {
            return !b.Equals(a);
        }

        public static bool operator !=(UInt256 a, ulong b)
        {
            return !a.Equals(b);
        }

        public static bool operator !=(ulong a, UInt256 b)
        {
            return !b.Equals(a);
        }

        public int CompareTo(UInt256 other)
        {
            if (s3 != other.s3)
                return s3.CompareTo(other.s3);
            if (s2 != other.s2)
                return s2.CompareTo(other.s2);
            if (s1 != other.s1)
                return s1.CompareTo(other.s1);
            return s0.CompareTo(other.s0);
        }

        public int CompareTo(int other)
        {
            if (s1 != 0 || other < 0)
                return 1;
            return s0.CompareTo((ulong) other);
        }

        public int CompareTo(uint other)
        {
            return s1 != 0 ? 1 : s0.CompareTo((ulong) other);
        }

        public int CompareTo(long other)
        {
            if (s1 != 0 || other < 0)
                return 1;
            return s0.CompareTo((ulong) other);
        }

        public int CompareTo(ulong other)
        {
            return s1 != 0 ? 1 : s0.CompareTo(other);
        }

        public int CompareTo(object obj)
        {
            if (obj == null)
                return 1;
            if (!(obj is UInt256))
                throw new ArgumentException();
            return CompareTo((UInt256) obj);
        }

        private static bool LessThan(ref UInt256 a, long b)
        {
            return b >= 0 && a.s3 == 0 && a.s2 == 0 && a.s1 == 0 && a.s0 < (ulong) b;
        }

        private static bool LessThan(long a, ref UInt256 b)
        {
            return a < 0 || b.s1 != 0 || b.s2 != 0 || b.s3 != 0 || (ulong) a < b.s0;
        }

        private static bool LessThan(ref UInt256 a, ulong b)
        {
            return a.s3 == 0 && a.s2 == 0 && a.s1 == 0 && a.s0 < b;
        }

        private static bool LessThan(ulong a, ref UInt256 b)
        {
            return b.s3 != 0 || b.s2 != 0 || b.s1 != 0 || a < b.s0;
        }

        private static bool LessThan(ref UInt256 a, ref UInt256 b)
        {
            if (a.s3 != b.s3)
                return a.s3 < b.s3;
            if (a.s2 != b.s2)
                return a.s2 < b.s2;
            if (a.s1 != b.s1)
                return a.s1 < b.s1;
            return a.s0 < b.s0;
        }

        public static bool Equals(ref UInt256 a, ref UInt256 b)
        {
            return a.s0 == b.s0 && a.s1 == b.s1 && a.s2 == b.s2 && a.s3 == b.s3;
        }

        public bool Equals(UInt256 other)
        {
            return s0 == other.s0 && s1 == other.s1 && s2 == other.s2 && s3 == other.s3;
        }

        public bool Equals(int other)
        {
            return other >= 0 && s0 == (uint) other && s1 == 0 && s2 == 0 && s3 == 0;
        }

        public bool Equals(uint other)
        {
            return s0 == other && s1 == 0 && s2 == 0 && s3 == 0;
        }

        public bool Equals(long other)
        {
            return other >= 0 && s0 == (ulong) other && s1 == 0 && s2 == 0 && s3 == 0;
        }

        public bool Equals(ulong other)
        {
            return s0 == other && s1 == 0 && s2 == 0 && s3 == 0;
        }

        public override bool Equals(object obj)
        {
            if (!(obj is UInt256))
                return false;
            return Equals((UInt256) obj);
        }

        public override int GetHashCode()
        {
            return s0.GetHashCode() ^ s1.GetHashCode() ^ s2.GetHashCode() ^ s3.GetHashCode();
        }

        public static void Multiply(out UInt256 c, ulong a, ulong b)
        {
            Multiply64(out c, a, b);
            Debug.Assert((BigInteger) c == (BigInteger) a * (BigInteger) b);
        }

        public static void Multiply(out UInt256 c, ref UInt256 a, uint b)
        {
            if (a.s1 == 0 && a.s2 == 0 && a.s3 == 0)
                Multiply64(out c, a.s0, b);
            else
                Multiply256(out c, ref a, b);
            Debug.Assert((BigInteger) c == (BigInteger) a * (BigInteger) b % ((BigInteger) 1 << 256));
        }

        public static void Multiply(out UInt256 c, ref UInt256 a, ulong b)
        {
            if (a.s1 == 0 && a.s2 == 0 && a.s3 == 0)
                Multiply64(out c, a.s0, b);
            else
                Multiply256(out c, ref a, b);
            Debug.Assert((BigInteger) c == (BigInteger) a * (BigInteger) b % ((BigInteger) 1 << 256));
        }

        public static void Multiply(out UInt256 c, ref UInt256 a, ref UInt256 b)
        {
            throw new NotImplementedException();
//            if ((a.s1 | b.s1) == 0)
//                Multiply64(out c, a.s0, b.s0);
//            else if (a.s1 == 0)
//                Multiply128(out c, ref b, a.s0);
//            else if (b.s1 == 0)
//                Multiply128(out c, ref a, b.s0);
//            else
//                Multiply128(out c, ref a, ref b);
//            Debug.Assert((BigInteger)c == (BigInteger)a * (BigInteger)b % ((BigInteger)1 << 256));
        }

        private static void Multiply(out UInt512 c, ref UInt256 a, ref UInt256 b)
        {
            throw new NotImplementedException();
//#if true
//            UInt128 c00, c01, c10, c11;
//            Multiply64(out c00, a.s0, b.s0);
//            Multiply64(out c01, a.s0, b.s1);
//            Multiply64(out c10, a.s1, b.s0);
//            Multiply64(out c11, a.s1, b.s1);
//            var carry1 = (uint)0;
//            var carry2 = (uint)0;
//            c.s0 = c00.S0;
//            c.s1 = Add(Add(c00.s1, c01.s0, ref carry1), c10.s0, ref carry1);
//            c.s2 = Add(Add(Add(c01.s1, c10.s1, ref carry2), c11.s0, ref carry2), carry1, ref carry2);
//            c.s3 = c11.s1 + carry2;
//#else
//            // Karatsuba method.
//            // Warning: doesn't correctly handle overflow.
//            UInt128 z0, z1, z2;
//            Multiply64(out z0, a.s0, b.s0);
//            Multiply64(out z2, a.s1, b.s1);
//            Multiply64(out z1, a.s0 + a.s1, b.s0 + b.s1);
//            Subtract(ref z1, ref z2);
//            Subtract(ref z1, ref z0);
//            var carry1 = (uint)0;
//            var carry2 = (uint)0;
//            c.s0 = z0.S0;
//            c.s1 = Add(z0.s1, z1.s0, ref carry1);
//            c.s2 = Add(Add(z1.s1, z2.s0, ref carry2), carry1, ref carry2);
//            c.s3 = z2.s1 + carry2;
//#endif
//            Debug.Assert((BigInteger)c == (BigInteger)a * (BigInteger)b);
        }

        public static UInt256 Abs(UInt256 a)
        {
            return a;
        }

        public static UInt256 Square(ulong a)
        {
            UInt256 c;
            Square(out c, a);
            return c;
        }

        public static UInt256 Square(UInt256 a)
        {
            UInt256 c;
            Square(out c, ref a);
            return c;
        }

        public static void Square(out UInt256 c, ulong a)
        {
            Square64(out c, a);
        }

        public static void Square(out UInt256 c, ref UInt256 a)
        {
            throw new NotImplementedException();
//            if (a.s1 == 0)
//                Square64(out c, a.s0);
//            else
//                Multiply128(out c, ref a, ref a);
        }

        public static UInt256 Cube(ulong a)
        {
            Cube(out UInt256 c, a);
            return c;
        }

        public static UInt256 Cube(UInt256 a)
        {
            Cube(out UInt256 c, ref a);
            return c;
        }

        public static void Cube(out UInt256 c, ulong a)
        {
            Square(out UInt256 square, a);
            Multiply(out c, ref square, a);
        }

        public static void Cube(out UInt256 c, ref UInt256 a)
        {
            UInt256 square;
            if (a.s1 == 0 && a.s2 == 0 && a.s3 == 0)
            {
                Square64(out square, a.s0);
                Multiply(out c, ref square, a.s0);
            }
            else
            {
                Multiply256(out square, ref a, ref a);
                Multiply256(out c, ref square, ref a);
            }
        }

        public static void Add(out UInt256 c, ulong a, ulong b)
        {
            c.s0 = a + b;
            c.s1 = 0;
            c.s2 = 0;
            c.s3 = 0;
            if (c.s0 < b)
                c.s1 = 1;

            Debug.Assert((BigInteger) c == ((BigInteger) a + (BigInteger) b));
        }

        public static void Add(out UInt256 c, ref UInt256 a, ulong b)
        {
            c.s0 = a.s0 + b;
            c.s1 = a.s1;
            c.s2 = a.s2;
            c.s3 = a.s3;
            if (c.s0 < b)
            {
                ++c.s1;
                if (c.s1 == 0)
                {
                    ++c.s2;
                    if (c.s2 == 0)
                    {
                        ++c.s3;
                    }
                }
            }

            Debug.Assert((BigInteger) c == ((BigInteger) a + (BigInteger) b) % ((BigInteger) 1 << 256));
        }

        public static void AddInPlace(Span<byte> a, Span<byte> b)
        {
            byte carry = 0;
            for (int i = 31; i >= 0; i--)
            {
                a[i] += b[i];
                if (a[i] < b[i])
                {
                    a[i] += carry;
                    carry = 1;
                }
                else if (carry == 1)
                {
                    a[i]++;
                    if (a[i] != 0)
                    {
                        carry = 0;
                    }
                }
            }
        }

        public static void Add(out UInt256 c, ref UInt256 a, ref UInt256 b, bool checkOverflows = true)
        {
            c.s0 = a.s0 + b.s0;
            c.s1 = a.s1 + b.s1;
            c.s2 = a.s2 + b.s2;
            c.s3 = a.s3 + b.s3;

            bool carry1 = false;
            bool carry2 = false;
            bool carry3 = false;

            if (c.s0 < b.s0)
            {
                carry1 = true;
            }

            if (c.s1 < a.s1)
            {
                carry2 = true;
            }

            if (c.s2 < a.s2)
            {
                carry3 = true;
            }

            if (carry1)
            {
                c.s1++;
                if (c.s1 == 0)
                {
                    carry2 = true;
                }
            }

            if (carry2)
            {
                c.s2++;
                if (c.s2 == 0)
                {
                    carry3 = true;
                }
            }

            if (carry3)
            {
                c.s3++;
            }

            if (checkOverflows && (c.s3 < a.S3 || c.s3 < b.S3))
            {
                throw new OverflowException("UInt256 add operation resulted in an overflow");
            }

            Debug.Assert((BigInteger) c == ((BigInteger) a + (BigInteger) b) % ((BigInteger) 1 << 256));
        }

        private static ulong Add(ulong a, ulong b, ref uint carry)
        {
            var c = a + b;
            if (c < b)
                ++carry;
            return c;
        }

        public static void Add(ref UInt256 a, ulong b)
        {
            var sum = a.s0 + b;
            if (sum < b)
            {
                ++a.s1;
                if (a.s1 == 0)
                {
                    ++a.s2;
                    if (a.s2 == 0)
                    {
                        a.s3++;
                    }
                }
            }

            a.s0 = sum;
        }

        public static void Add(ref UInt256 a, ref UInt256 b, bool checkOverflows = true)
        {
            UInt256 c;
            c.s0 = a.s0 + b.s0;
            c.s1 = a.s1 + b.s1;
            c.s2 = a.s2 + b.s2;
            c.s3 = a.s3 + b.s3;

            bool carry1 = false;
            bool carry2 = false;
            bool carry3 = false;

            if (c.s0 < b.s0)
            {
                carry1 = true;
            }

            if (c.s1 < a.s1)
            {
                carry2 = true;
            }

            if (c.s2 < a.s2)
            {
                carry3 = true;
            }

            if (carry1)
            {
                c.s1++;
                if (c.s1 == 0)
                {
                    carry2 = true;
                }
            }

            if (carry2)
            {
                c.s2++;
                if (c.s2 == 0)
                {
                    carry3 = true;
                }
            }

            if (carry3)
            {
                c.s3++;
            }

            if (checkOverflows && (c.s3 < a.S3 || c.s3 < b.S3))
            {
                throw new OverflowException("UInt256 add operation resulted in an overflow");
            }

            Debug.Assert((BigInteger) c == ((BigInteger) a + (BigInteger) b) % ((BigInteger) 1 << 256));

            a.s0 = c.s0;
            a.s1 = c.s1;
            a.s2 = c.s2;
            a.s3 = c.s3;
        }

        public static void Add(ref UInt256 a, UInt256 b)
        {
            Add(ref a, ref b);
        }

        public static void Subtract(out UInt256 c, ref UInt256 a, ulong b)
        {
            UInt128 at0 = a.t0;
            UInt128 at1 = a.t1;

            UInt128 bt0 = b;
            UInt128 bt1 = 0;

            if (at0 < bt0)
            {
                --at1;
            }

            at0 -= bt0;
            at1 -= bt1;

            c.s0 = at0.S0;
            c.s1 = at0.S1;
            c.s2 = at1.S0;
            c.s3 = at1.S1;

            Debug.Assert((BigInteger) c ==
                         ((BigInteger) a - (BigInteger) b + ((BigInteger) 1 << 256)) % ((BigInteger) 1 << 256));
        }

        public static void Subtract(out UInt256 c, ulong a, ref UInt256 b)
        {
            UInt128 at0 = a;
            UInt128 at1 = 0;

            UInt128 bt0 = b.t0;
            UInt128 bt1 = b.t1;

            if (at0 < bt0)
            {
                --at1;
            }

            at0 -= bt0;
            at1 -= bt1;

            c.s0 = at0.S0;
            c.s1 = at0.S1;
            c.s2 = at1.S0;
            c.s3 = at1.S1;

            Debug.Assert((BigInteger) c ==
                         ((BigInteger) a - (BigInteger) b + ((BigInteger) 1 << 256)) % ((BigInteger) 1 << 256));
        }

        public static void Subtract(out UInt256 c, ref UInt256 a, ref UInt256 b)
        {
            UInt128 at0 = a.t0;
            UInt128 at1 = a.t1;

            UInt128 bt0 = b.t0;
            UInt128 bt1 = b.t1;

            if (at0 < bt0)
            {
                --at1;
            }

            at0 -= bt0;
            at1 -= bt1;

            c.s0 = at0.S0;
            c.s1 = at0.S1;
            c.s2 = at1.S0;
            c.s3 = at1.S1;

            Debug.Assert((BigInteger) c ==
                         ((BigInteger) a - (BigInteger) b + ((BigInteger) 1 << 256)) % ((BigInteger) 1 << 256));
        }

        public static void Subtract(ref UInt256 a, ulong b)
        {
            UInt128 at0 = a.t0;
            UInt128 at1 = a.t1;

            if (at0 < b)
            {
                --at1;
            }

            UInt128.Subtract(ref at0, b);
            a.s0 = at0.S0;
            a.s1 = at0.S1;
            a.s2 = at1.S0;
            a.s3 = at1.S1;
        }

        public static void Subtract(ref UInt256 a, ref UInt256 b)
        {
            UInt128 at0 = a.t0;
            UInt128 at1 = a.t1;

            UInt128 bt0 = b.t0;
            UInt128 bt1 = b.t1;

            if (at0 < bt0)
            {
                --at1;
            }

            at0 -= bt0;
            at1 -= bt1;

            a.s0 = at0.S0;
            a.s1 = at0.S1;
            a.s2 = at1.S0;
            a.s3 = at1.S1;
        }

        public static void Subtract(ref UInt256 a, UInt256 b)
        {
            Subtract(ref a, ref b);
        }

        private static void Square64(out UInt256 w, ulong u)
        {
            var u0 = (ulong) (uint) u;
            var u1 = u >> 32;
            var carry = u0 * u0;
            var r0 = (uint) carry;
            var u0u1 = u0 * u1;
            carry = (carry >> 32) + u0u1;
            var r2 = carry >> 32;
            carry = (uint) carry + u0u1;
            w.s0 = carry << 32 | r0;
            w.s1 = (carry >> 32) + r2 + u1 * u1;
            w.s2 = 0;
            w.s3 = 0;
            Debug.Assert((BigInteger) w == (BigInteger) u * u);
        }

        private static void Multiply64(out UInt256 w, uint u, uint v)
        {
            w.s0 = (ulong) u * v;
            w.s1 = 0;
            w.s2 = 0;
            w.s3 = 0;
            Debug.Assert((BigInteger) w == (BigInteger) u * v);
        }

        private static void Multiply64(out UInt256 w, ulong u, uint v)
        {
            var u0 = (ulong) (uint) u;
            var u1 = u >> 32;
            var carry = u0 * v;
            var r0 = (uint) carry;
            carry = (carry >> 32) + u1 * v;
            w.s0 = carry << 32 | r0;
            w.s1 = carry >> 32;
            w.s2 = 0;
            w.s3 = 0;
            Debug.Assert((BigInteger) w == (BigInteger) u * v);
        }

        private static void Multiply64(out UInt256 w, ulong u, ulong v)
        {
            var u0 = (ulong) (uint) u;
            var u1 = u >> 32;
            var v0 = (ulong) (uint) v;
            var v1 = v >> 32;
            var carry = u0 * v0;
            var r0 = (uint) carry;
            carry = (carry >> 32) + u0 * v1;
            var r2 = carry >> 32;
            carry = (uint) carry + u1 * v0;
            w.s0 = carry << 32 | r0;
            w.s1 = (carry >> 32) + r2 + u1 * v1;
            w.s2 = 0;
            w.s3 = 0;
            Debug.Assert((BigInteger) w == (BigInteger) u * v);
        }

        private static void Multiply64(out UInt256 w, ulong u, ulong v, ulong c)
        {
            var u0 = (ulong) (uint) u;
            var u1 = u >> 32;
            var v0 = (ulong) (uint) v;
            var v1 = v >> 32;
            var carry = u0 * v0 + (uint) c;
            var r0 = (uint) carry;
            carry = (carry >> 32) + u0 * v1 + (c >> 32);
            var r2 = carry >> 32;
            carry = (uint) carry + u1 * v0;
            w.s0 = carry << 32 | r0;
            w.s1 = (carry >> 32) + r2 + u1 * v1;
            w.s2 = 0;
            w.s3 = 0;
            Debug.Assert((BigInteger) w == (BigInteger) u * v + c);
        }

        private static ulong MultiplyHigh64(ulong u, ulong v, ulong c)
        {
            var u0 = (ulong) (uint) u;
            var u1 = u >> 32;
            var v0 = (ulong) (uint) v;
            var v1 = v >> 32;
            var carry = ((u0 * v0 + (uint) c) >> 32) + u0 * v1 + (c >> 32);
            var r2 = carry >> 32;
            carry = (uint) carry + u1 * v0;
            return (carry >> 32) + r2 + u1 * v1;
        }

        private static void Multiply256(out UInt256 w, ref UInt256 u, uint v)
        {
            Multiply64(out UInt256 w0, u.s0, v);
            Multiply64(out UInt256 w1, u.s1, v);
            Multiply64(out UInt256 w2, u.s2, v);

            LeftShift(ref w1, 64);
            LeftShift(ref w2, 128);

            w = w0 + w1 + w2;
            w.s3 = w2.s3 + u.s3 * v;

            Debug.Assert((BigInteger) w == (BigInteger) u * v % ((BigInteger) 1 << 256));
        }

        private static void Multiply256(out UInt256 w, ref UInt256 u, ulong v)
        {
            Multiply64(out UInt256 w0, u.s0, v);
            Multiply64(out UInt256 w1, u.s1, v);
            Multiply64(out UInt256 w2, u.s2, v);

            LeftShift(ref w1, 64);
            LeftShift(ref w2, 128);

            w = w0 + w1 + w2;
            w.s3 = w2.s3 + u.s3 * v;

            Debug.Assert((BigInteger) w == (BigInteger) u * v % ((BigInteger) 1 << 256));
        }

        private static void Multiply256(out UInt256 w, ref UInt256 u, ref UInt256 v)
        {
            throw new NotImplementedException();
//            Multiply64(out w, u.s0, v.s0);
//            w.s1 += u.s1 * v.s0 + u.s0 * v.s1;
//            Debug.Assert((BigInteger)w == (BigInteger)u * v % ((BigInteger)1 << 256));
        }

        public static void Divide(out UInt256 w, ref UInt256 u, uint v)
        {
            throw new NotImplementedException();
//            if (u.s1 == 0)
//                Divide64(out w, u.s0, v);
//            else if (u.s1 <= uint.MaxValue)
//                Divide96(out w, ref u, v);
//            else
//                Divide128(out w, ref u, v);
        }

        public static void Divide(out UInt256 w, ref UInt256 u, ulong v)
        {
            throw new NotImplementedException();
//            if (u.s1 == 0)
//                Divide64(out w, u.s0, v);
//            else
//            {
//                var v0 = (uint)v;
//                if (v == v0)
//                {
//                    if (u.s1 <= uint.MaxValue)
//                        Divide96(out w, ref u, v0);
//                    else
//                        Divide128(out w, ref u, v0);
//                }
//                else
//                {
//                    if (u.s1 <= uint.MaxValue)
//                        Divide96(out w, ref u, v);
//                    else
//                        Divide128(out w, ref u, v);
//                }
//            }
        }

        public static void Divide(out UInt256 c, ref UInt256 a, ref UInt256 b)
        {
            throw new NotImplementedException();
//            if (LessThan(ref a, ref b))
//                c = Zero;
//            else if (b.s1 == 0)
//                Divide(out c, ref a, b.s0);
//            else if (b.s1 <= uint.MaxValue)
//            {
//                UInt128 rem;
//                Create(out c, DivRem96(out rem, ref a, ref b));
//            }
//            else
//            {
//                UInt128 rem;
//                Create(out c, DivRem128(out rem, ref a, ref b));
//            }
        }

        public static uint Remainder(ref UInt256 u, uint v)
        {
            if (u.s1 == 0)
                return (uint) (u.s0 % v);
            throw new NotImplementedException();
//            if (u.s1 <= uint.MaxValue)
//                return Remainder96(ref u, v);
//            return Remainder128(ref u, v);
        }

        public static ulong Remainder(ref UInt256 u, ulong v)
        {
            throw new NotImplementedException();
//            if (u.s1 == 0)
//                return u.s0 % v;
//            var v0 = (uint)v;
//            if (v == v0)
//            {
//                if (u.s1 <= uint.MaxValue)
//                    return Remainder96(ref u, v0);
//                return Remainder128(ref u, v0);
//            }
//            if (u.s1 <= uint.MaxValue)
//                return Remainder96(ref u, v);
//            return Remainder128(ref u, v);
        }

        public static void Remainder(out UInt256 c, ref UInt256 a, ref UInt256 b)
        {
            throw new NotImplementedException();
//            if (LessThan(ref a, ref b))
//                c = a;
//            else if (b.s1 == 0)
//                Create(out c, Remainder(ref a, b.s0));
//            else if (b.s1 <= uint.MaxValue)
//                DivRem96(out c, ref a, ref b);
//            else
//                DivRem128(out c, ref a, ref b);
        }

        public static void Remainder(ref UInt256 a, ref UInt256 b)
        {
            throw new NotImplementedException();
//            UInt128 a2 = a;
//            Remainder(out a, ref a2, ref b);
        }

        private static void Remainder(out UInt256 c, ref UInt512 a, ref UInt256 b)
        {
            throw new NotImplementedException();
//            if (b.r3 == 0)
//                Remainder192(out c, ref a, ref b);
//            else
//                Remainder256(out c, ref a, ref b);
        }

        private static void Divide64(out UInt256 w, ulong u, ulong v)
        {
            throw new NotImplementedException();
//            w.s1 = 0;
//            w.s0 = u / v;
//            Debug.Assert((BigInteger)w == (BigInteger)u / v);
        }

        private static void Divide96(out UInt256 w, ref UInt256 u, uint v)
        {
            throw new NotImplementedException();
//            var r2 = u.r2;
//            var w2 = r2 / v;
//            var u0 = (ulong)(r2 - w2 * v);
//            var u0u1 = u0 << 32 | u.r1;
//            var w1 = (uint)(u0u1 / v);
//            u0 = u0u1 - w1 * v;
//            u0u1 = u0 << 32 | u.r0;
//            var w0 = (uint)(u0u1 / v);
//            w.s1 = w2;
//            w.s0 = (ulong)w1 << 32 | w0;
//            Debug.Assert((BigInteger)w == (BigInteger)u / v);
        }

        private static void Divide128(out UInt256 w, ref UInt256 u, uint v)
        {
            throw new NotImplementedException();
//            var r3 = u.r3;
//            var w3 = r3 / v;
//            var u0 = (ulong)(r3 - w3 * v);
//            var u0u1 = u0 << 32 | u.r2;
//            var w2 = (uint)(u0u1 / v);
//            u0 = u0u1 - w2 * v;
//            u0u1 = u0 << 32 | u.r1;
//            var w1 = (uint)(u0u1 / v);
//            u0 = u0u1 - w1 * v;
//            u0u1 = u0 << 32 | u.r0;
//            var w0 = (uint)(u0u1 / v);
//            w.s1 = (ulong)w3 << 32 | w2;
//            w.s0 = (ulong)w1 << 32 | w0;
//            Debug.Assert((BigInteger)w == (BigInteger)u / v);
        }

        private static void Divide96(out UInt256 w, ref UInt256 u, ulong v)
        {
            throw new NotImplementedException();
//            w.s0 = w.s1 = 0;
//            var dneg = GetBitLength((uint)(v >> 32));
//            var d = 32 - dneg;
//            var vPrime = v << d;
//            var v1 = (uint)(vPrime >> 32);
//            var v2 = (uint)vPrime;
//            var r0 = u.r0;
//            var r1 = u.r1;
//            var r2 = u.r2;
//            var r3 = (uint)0;
//            if (d != 0)
//            {
//                r3 = r2 >> dneg;
//                r2 = r2 << d | r1 >> dneg;
//                r1 = r1 << d | r0 >> dneg;
//                r0 <<= d;
//            }
//            var q1 = DivRem(r3, ref r2, ref r1, v1, v2);
//            var q0 = DivRem(r2, ref r1, ref r0, v1, v2);
//            w.s0 = (ulong)q1 << 32 | q0;
//            w.s1 = 0;
//            Debug.Assert((BigInteger)w == (BigInteger)u / v);
        }

        private static void Divide128(out UInt256 w, ref UInt256 u, ulong v)
        {
            throw new NotImplementedException();
//            w.s0 = w.s1 = 0;
//            var dneg = GetBitLength((uint)(v >> 32));
//            var d = 32 - dneg;
//            var vPrime = v << d;
//            var v1 = (uint)(vPrime >> 32);
//            var v2 = (uint)vPrime;
//            var r0 = u.r0;
//            var r1 = u.r1;
//            var r2 = u.r2;
//            var r3 = u.r3;
//            var r4 = (uint)0;
//            if (d != 0)
//            {
//                r4 = r3 >> dneg;
//                r3 = r3 << d | r2 >> dneg;
//                r2 = r2 << d | r1 >> dneg;
//                r1 = r1 << d | r0 >> dneg;
//                r0 <<= d;
//            }
//            w.s1 = DivRem(r4, ref r3, ref r2, v1, v2);
//            var q1 = DivRem(r3, ref r2, ref r1, v1, v2);
//            var q0 = DivRem(r2, ref r1, ref r0, v1, v2);
//            w.s0 = (ulong)q1 << 32 | q0;
//            Debug.Assert((BigInteger)w == (BigInteger)u / v);
        }

        private static uint Remainder96(ref UInt256 u, uint v)
        {
            throw new NotImplementedException();
//            var u0 = (ulong)(u.r2 % v);
//            var u0u1 = u0 << 32 | u.r1;
//            u0 = u0u1 % v;
//            u0u1 = u0 << 32 | u.r0;
//            return (uint)(u0u1 % v);
        }

        private static uint Remainder128(ref UInt256 u, uint v)
        {
            throw new NotImplementedException();
//            var u0 = (ulong)(u.r3 % v);
//            var u0u1 = u0 << 32 | u.r2;
//            u0 = u0u1 % v;
//            u0u1 = u0 << 32 | u.r1;
//            u0 = u0u1 % v;
//            u0u1 = u0 << 32 | u.r0;
//            return (uint)(u0u1 % v);
        }

        private static ulong Remainder96(ref UInt256 u, ulong v)
        {
            throw new NotImplementedException();
//            var dneg = GetBitLength((uint)(v >> 32));
//            var d = 32 - dneg;
//            var vPrime = v << d;
//            var v1 = (uint)(vPrime >> 32);
//            var v2 = (uint)vPrime;
//            var r0 = u.r0;
//            var r1 = u.r1;
//            var r2 = u.r2;
//            var r3 = (uint)0;
//            if (d != 0)
//            {
//                r3 = r2 >> dneg;
//                r2 = r2 << d | r1 >> dneg;
//                r1 = r1 << d | r0 >> dneg;
//                r0 <<= d;
//            }
//            DivRem(r3, ref r2, ref r1, v1, v2);
//            DivRem(r2, ref r1, ref r0, v1, v2);
//            return ((ulong)r1 << 32 | r0) >> d;
        }

        private static ulong Remainder128(ref UInt256 u, ulong v)
        {
            throw new NotImplementedException();
//            var dneg = GetBitLength((uint)(v >> 32));
//            var d = 32 - dneg;
//            var vPrime = v << d;
//            var v1 = (uint)(vPrime >> 32);
//            var v2 = (uint)vPrime;
//            var r0 = u.r0;
//            var r1 = u.r1;
//            var r2 = u.r2;
//            var r3 = u.r3;
//            var r4 = (uint)0;
//            if (d != 0)
//            {
//                r4 = r3 >> dneg;
//                r3 = r3 << d | r2 >> dneg;
//                r2 = r2 << d | r1 >> dneg;
//                r1 = r1 << d | r0 >> dneg;
//                r0 <<= d;
//            }
//            DivRem(r4, ref r3, ref r2, v1, v2);
//            DivRem(r3, ref r2, ref r1, v1, v2);
//            DivRem(r2, ref r1, ref r0, v1, v2);
//            return ((ulong)r1 << 32 | r0) >> d;
        }

        private static ulong DivRem96(out UInt256 rem, ref UInt256 a, ref UInt128 b)
        {
            throw new NotImplementedException();
//            var d = 32 - GetBitLength(b.r2);
//            UInt128 v;
//            LeftShift64(out v, ref b, d);
//            var r4 = (uint)LeftShift64(out rem, ref a, d);
//            var v1 = v.r2;
//            var v2 = v.r1;
//            var v3 = v.r0;
//            var r3 = rem.r3;
//            var r2 = rem.r2;
//            var r1 = rem.r1;
//            var r0 = rem.r0;
//            var q1 = DivRem(r4, ref r3, ref r2, ref r1, v1, v2, v3);
//            var q0 = DivRem(r3, ref r2, ref r1, ref r0, v1, v2, v3);
//            Create(out rem, r0, r1, r2, 0);
//            var div = (ulong)q1 << 32 | q0;
//            RightShift64(ref rem, d);
//            Debug.Assert((BigInteger)div == (BigInteger)a / (BigInteger)b);
//            Debug.Assert((BigInteger)rem == (BigInteger)a % (BigInteger)b);
//            return div;
        }

        private static uint DivRem128(out UInt256 rem, ref UInt256 a, ref UInt256 b)
        {
            throw new NotImplementedException();
//            var d = 32 - GetBitLength(b.r3);
//            UInt128 v;
//            LeftShift64(out v, ref b, d);
//            var r4 = (uint)LeftShift64(out rem, ref a, d);
//            var r3 = rem.r3;
//            var r2 = rem.r2;
//            var r1 = rem.r1;
//            var r0 = rem.r0;
//            var div = DivRem(r4, ref r3, ref r2, ref r1, ref r0, v.r3, v.r2, v.r1, v.r0);
//            Create(out rem, r0, r1, r2, r3);
//            RightShift64(ref rem, d);
//            Debug.Assert((BigInteger)div == (BigInteger)a / (BigInteger)b);
//            Debug.Assert((BigInteger)rem == (BigInteger)a % (BigInteger)b);
//            return div;
        }

        private static void Remainder192(out UInt256 c, ref UInt256 a, ref UInt256 b)
        {
            throw new NotImplementedException();
//            var d = 32 - GetBitLength(b.r2);
//            UInt128 v;
//            LeftShift64(out v, ref b, d);
//            var v1 = v.r2;
//            var v2 = v.r1;
//            var v3 = v.r0;
//            UInt256 rem;
//            LeftShift64(out rem, ref a, d);
//            var r6 = rem.r6;
//            var r5 = rem.r5;
//            var r4 = rem.r4;
//            var r3 = rem.r3;
//            var r2 = rem.r2;
//            var r1 = rem.r1;
//            var r0 = rem.r0;
//            DivRem(r6, ref r5, ref r4, ref r3, v1, v2, v3);
//            DivRem(r5, ref r4, ref r3, ref r2, v1, v2, v3);
//            DivRem(r4, ref r3, ref r2, ref r1, v1, v2, v3);
//            DivRem(r3, ref r2, ref r1, ref r0, v1, v2, v3);
//            Create(out c, r0, r1, r2, 0);
//            RightShift64(ref c, d);
//            Debug.Assert((BigInteger)c == (BigInteger)a % (BigInteger)b);
        }

        private static void Remainder256(out UInt256 c, ref UInt256 a, ref UInt256 b)
        {
            throw new NotImplementedException();
//            var d = 32 - GetBitLength(b.r3);
//            UInt128 v;
//            LeftShift64(out v, ref b, d);
//            var v1 = v.r3;
//            var v2 = v.r2;
//            var v3 = v.r1;
//            var v4 = v.r0;
//            UInt256 rem;
//            var r8 = (uint)LeftShift64(out rem, ref a, d);
//            var r7 = rem.r7;
//            var r6 = rem.r6;
//            var r5 = rem.r5;
//            var r4 = rem.r4;
//            var r3 = rem.r3;
//            var r2 = rem.r2;
//            var r1 = rem.r1;
//            var r0 = rem.r0;
//            DivRem(r8, ref r7, ref r6, ref r5, ref r4, v1, v2, v3, v4);
//            DivRem(r7, ref r6, ref r5, ref r4, ref r3, v1, v2, v3, v4);
//            DivRem(r6, ref r5, ref r4, ref r3, ref r2, v1, v2, v3, v4);
//            DivRem(r5, ref r4, ref r3, ref r2, ref r1, v1, v2, v3, v4);
//            DivRem(r4, ref r3, ref r2, ref r1, ref r0, v1, v2, v3, v4);
//            Create(out c, r0, r1, r2, r3);
//            RightShift64(ref c, d);
//            Debug.Assert((BigInteger)c == (BigInteger)a % (BigInteger)b);
        }

        private static ulong Q(uint u0, uint u1, uint u2, uint v1, uint v2)
        {
            throw new NotImplementedException();
//            var u0u1 = (ulong)u0 << 32 | u1;
//            var qhat = u0 == v1 ? uint.MaxValue : u0u1 / v1;
//            var r = u0u1 - qhat * v1;
//            if (r == (uint)r && v2 * qhat > (r << 32 | u2))
//            {
//                --qhat;
//                r += v1;
//                if (r == (uint)r && v2 * qhat > (r << 32 | u2))
//                {
//                    --qhat;
//                    r += v1;
//                }
//            }
//            return qhat;
        }

        private static uint DivRem(uint u0, ref uint u1, ref uint u2, uint v1, uint v2)
        {
            throw new NotImplementedException();
//            var qhat = Q(u0, u1, u2, v1, v2);
//            var carry = qhat * v2;
//            var borrow = (long)u2 - (uint)carry;
//            carry >>= 32;
//            u2 = (uint)borrow;
//            borrow >>= 32;
//            carry += qhat * v1;
//            borrow += (long)u1 - (uint)carry;
//            carry >>= 32;
//            u1 = (uint)borrow;
//            borrow >>= 32;
//            borrow += (long)u0 - (uint)carry;
//            if (borrow != 0)
//            {
//                --qhat;
//                carry = (ulong)u2 + v2;
//                u2 = (uint)carry;
//                carry >>= 32;
//                carry += (ulong)u1 + v1;
//                u1 = (uint)carry;
//            }
//            return (uint)qhat;
        }

        private static uint DivRem(uint u0, ref uint u1, ref uint u2, ref uint u3, uint v1, uint v2, uint v3)
        {
            throw new NotImplementedException();
//            var qhat = Q(u0, u1, u2, v1, v2);
//            var carry = qhat * v3;
//            var borrow = (long)u3 - (uint)carry;
//            carry >>= 32;
//            u3 = (uint)borrow;
//            borrow >>= 32;
//            carry += qhat * v2;
//            borrow += (long)u2 - (uint)carry;
//            carry >>= 32;
//            u2 = (uint)borrow;
//            borrow >>= 32;
//            carry += qhat * v1;
//            borrow += (long)u1 - (uint)carry;
//            carry >>= 32;
//            u1 = (uint)borrow;
//            borrow >>= 32;
//            borrow += (long)u0 - (uint)carry;
//            if (borrow != 0)
//            {
//                --qhat;
//                carry = (ulong)u3 + v3;
//                u3 = (uint)carry;
//                carry >>= 32;
//                carry += (ulong)u2 + v2;
//                u2 = (uint)carry;
//                carry >>= 32;
//                carry += (ulong)u1 + v1;
//                u1 = (uint)carry;
//            }
//            return (uint)qhat;
        }

        private static uint DivRem(uint u0, ref uint u1, ref uint u2, ref uint u3, ref uint u4, uint v1, uint v2,
            uint v3, uint v4)
        {
            throw new NotImplementedException();
//            var qhat = Q(u0, u1, u2, v1, v2);
//            var carry = qhat * v4;
//            var borrow = (long)u4 - (uint)carry;
//            carry >>= 32;
//            u4 = (uint)borrow;
//            borrow >>= 32;
//            carry += qhat * v3;
//            borrow += (long)u3 - (uint)carry;
//            carry >>= 32;
//            u3 = (uint)borrow;
//            borrow >>= 32;
//            carry += qhat * v2;
//            borrow += (long)u2 - (uint)carry;
//            carry >>= 32;
//            u2 = (uint)borrow;
//            borrow >>= 32;
//            carry += qhat * v1;
//            borrow += (long)u1 - (uint)carry;
//            carry >>= 32;
//            u1 = (uint)borrow;
//            borrow >>= 32;
//            borrow += (long)u0 - (uint)carry;
//            if (borrow != 0)
//            {
//                --qhat;
//                carry = (ulong)u4 + v4;
//                u4 = (uint)carry;
//                carry >>= 32;
//                carry += (ulong)u3 + v3;
//                u3 = (uint)carry;
//                carry >>= 32;
//                carry += (ulong)u2 + v2;
//                u2 = (uint)carry;
//                carry >>= 32;
//                carry += (ulong)u1 + v1;
//                u1 = (uint)carry;
//            }
//            return (uint)qhat;
        }

        public static void ModAdd(out UInt256 c, ref UInt256 a, ref UInt256 b, ref UInt256 modulus)
        {
            // this is wrong I guess
            Add(out c, ref a, ref b);
            if (!LessThan(ref c, ref modulus) || LessThan(ref c, ref a) && LessThan(ref c, ref b))
                Subtract(ref c, ref modulus);
        }

        public static void ModSub(out UInt256 c, ref UInt256 a, ref UInt256 b, ref UInt256 modulus)
        {
            // this is wrong I guess
            Subtract(out c, ref a, ref b);
            if (LessThan(ref a, ref b))
                Add(ref c, ref modulus);
        }

        public static void ModMul(out UInt256 c, ref UInt256 a, ref UInt256 b, ref UInt256 modulus)
        {
            throw new NotImplementedException();
//            if (modulus.s1 == 0)
//            {
//                UInt128 product;
//                Multiply64(out product, a.s0, b.s0);
//                Create(out c, UInt128.Remainder(ref product, modulus.s0));
//            }
//            else
//            {
//                UInt256 product;
//                Multiply(out product, ref a, ref b);
//                Remainder(out c, ref product, ref modulus);
//            }
        }

        public static void ModMul(ref UInt256 a, ref UInt256 b, ref UInt256 modulus)
        {
            throw new NotImplementedException();
//            if (modulus.s1 == 0)
//            {
//                UInt128 product;
//                Multiply64(out product, a.s0, b.s0);
//                Create(out a, UInt128.Remainder(ref product, modulus.s0));
//            }
//            else
//            {
//                UInt256 product;
//                Multiply(out product, ref a, ref b);
//                Remainder(out a, ref product, ref modulus);
//            }
        }

        public static void ModPow(out UInt256 result, ref UInt256 value, ref UInt256 exponent, ref UInt256 modulus)
        {
            throw new NotImplementedException();
//            result = one;
//            var v = value;
//            var e = exponent.s0;
//            if (exponent.s1 != 0)
//            {
//                for (var i = 0; i < 64; i++)
//                {
//                    if ((e & 1) != 0)
//                        ModMul(ref result, ref v, ref modulus);
//                    ModMul(ref v, ref v, ref modulus);
//                    e >>= 1;
//                }
//                e = exponent.s1;
//            }
//            while (e != 0)
//            {
//                if ((e & 1) != 0)
//                    ModMul(ref result, ref v, ref modulus);
//                if (e != 1)
//                    ModMul(ref v, ref v, ref modulus);
//                e >>= 1;
//            }
//            Debug.Assert(BigInteger.ModPow(value, exponent, modulus) == result);
        }

        public static void Shift(out UInt256 c, ref UInt256 a, int d)
        {
            if (d < 0)
                RightShift(out c, ref a, -d);
            else
                LeftShift(out c, ref a, d);
        }

        public static void ArithmeticShift(out UInt256 c, ref UInt256 a, int d)
        {
            if (d < 0)
                ArithmeticRightShift(out c, ref a, -d);
            else
                LeftShift(out c, ref a, d);
        }

        private static ulong LeftShift64(out UInt256 c, ref UInt256 a, int d)
        {
            if (d == 0)
            {
                c = a;
                return 0;
            }

            var dneg = 64 - d;
            c.s3 = a.s3 << d | a.s2 >> dneg;
            c.s2 = a.s2 << d | a.s1 >> dneg;
            c.s1 = a.s1 << d | a.s0 >> dneg;
            c.s0 = a.s0 << d;
            return a.s3 >> dneg;
        }

        private static ulong LeftShift64(out UInt512 c, ref UInt512 a, int d)
        {
            if (d == 0)
            {
                c = a;
                return 0;
            }

            var dneg = 64 - d;
            c.s7 = a.s7 << d | a.s6 >> dneg;
            c.s6 = a.s6 << d | a.s5 >> dneg;
            c.s5 = a.s5 << d | a.s4 >> dneg;
            c.s4 = a.s4 << d | a.s3 >> dneg;
            c.s3 = a.s3 << d | a.s2 >> dneg;
            c.s2 = a.s2 << d | a.s1 >> dneg;
            c.s1 = a.s1 << d | a.s0 >> dneg;
            c.s0 = a.s0 << d;
            return a.s7 >> dneg;
        }

        public static void LeftShift(out UInt256 c, ref UInt256 a, int b)
        {
            c = a;
            LeftShift(ref c, b);
        }

        public static void RightShift64(out UInt256 c, ref UInt256 a, int b)
        {
            throw new NotImplementedException();
//            if (b == 0)
//                c = a;
//            else
//            {
//                c.s0 = a.s0 >> b | a.s1 << (64 - b);
//                c.s1 = a.s1 >> b;
//            }
        }

        public static void RightShift(out UInt256 c, ref UInt256 a, int b)
        {
            c = a;
            RightShift(ref c, b);
        }

//        public static void ArithmeticRightShift64(out UInt256 c, ref UInt256 a, int b)
//        {
//            throw new NotImplementedException();
////            if (b == 0)
////                c = a;
////            else
////            {
////                c.s0 = a.s0 >> b | a.s1 << (64 - b);
////                c.s1 = (ulong)((long)a.s1 >> b);
////            }
//        }

        public static void ArithmeticRightShift(out UInt256 c, ref UInt256 a, int b)
        {
            c = a;
            int rem = b % 64;
            RightShift64(ref c, rem);
            FullRightShift(ref c, b - rem);
            c.s3 = (ulong) (long) c.s3;
        }

        public static void And(out UInt256 c, ref UInt256 a, ref UInt256 b)
        {
            c.s0 = a.s0 & b.s0;
            c.s1 = a.s1 & b.s1;
            c.s2 = a.s2 & b.s2;
            c.s3 = a.s3 & b.s3;
        }

        public static void Or(out UInt256 c, ref UInt256 a, ref UInt256 b)
        {
            c.s0 = a.s0 | b.s0;
            c.s1 = a.s1 | b.s1;
            c.s2 = a.s2 | b.s2;
            c.s3 = a.s3 | b.s3;
        }

        public static void ExclusiveOr(out UInt256 c, ref UInt256 a, ref UInt256 b)
        {
            c.s0 = a.s0 ^ b.s0;
            c.s1 = a.s1 ^ b.s1;
            c.s2 = a.s2 ^ b.s2;
            c.s3 = a.s3 ^ b.s3;
        }

        public static void Not(out UInt256 c, ref UInt256 a)
        {
            c.s0 = ~a.s0;
            c.s1 = ~a.s1;
            c.s2 = ~a.s2;
            c.s3 = ~a.s3;
        }

        public static void Negate(ref UInt256 a)
        {
            var s0 = a.s0;
            a.s0 = 0 - s0;
            a.s1 = 0 - a.s1;
            a.s2 = 0 - a.s2;
            a.s3 = 0 - a.s3;
            if (s0 > 0)
                --a.s3;
        }

        public static void Negate(out UInt256 c, ref UInt256 a)
        {
            c.s0 = 0 - a.s0;
            c.s1 = 0 - a.s1;
            c.s2 = 0 - a.s2;
            c.s3 = 0 - a.s3;
            if (a.s0 > 0)
                --c.s3;
            Debug.Assert((BigInteger) c == (BigInteger) (~a + 1));
        }

        public static explicit operator float(UInt256 a)
        {
            return ConvertToFloat(ref a);
        }

        public static explicit operator double(UInt256 a)
        {
            return ConvertToDouble(ref a);
        }

        public static float ConvertToFloat(ref UInt256 a)
        {
            if (a.s1 == 0)
                return a.s0;
            return a.s1 * (float) ulong.MaxValue + a.s0;
        }

        public static double ConvertToDouble(ref UInt256 a)
        {
            if (a.s1 == 0)
                return a.s0;
            return a.s1 * (double) ulong.MaxValue + a.s0;
        }

        public static void Pow(out UInt256 result, ref UInt256 value, uint exponent)
        {
            result = one;
            while (exponent != 0)
            {
                if ((exponent & 1) != 0)
                {
                    var previous = result;
                    Multiply(out result, ref previous, ref value);
                }

                if (exponent != 1)
                {
                    var previous = value;
                    Square(out value, ref previous);
                }

                exponent >>= 1;
            }
        }

        public static UInt256 Pow(UInt256 value, uint exponent)
        {
            Pow(out UInt256 result, ref value, exponent);
            return result;
        }

        private const int MaxRepShift = 53;
        private const ulong MaxRep = (ulong) 1 << MaxRepShift;
        private static readonly UInt256 MaxRepSquaredHigh = (ulong) 1 << (2 * MaxRepShift - 64);

        public static ulong FloorSqrt(UInt256 a)
        {
            if (a.s1 == 0 && a.s0 <= MaxRep)
                return (ulong) Math.Sqrt(a.s0);
            var s = (ulong) Math.Sqrt(ConvertToDouble(ref a));
            if (a.s1 < MaxRepSquaredHigh)
            {
                UInt256 s2;
                Square(out s2, s);
                var r = a.s0 - s2.s0;
                if (r > long.MaxValue)
                    --s;
                else if (r - (s << 1) <= long.MaxValue)
                    ++s;
                Debug.Assert((BigInteger) s * s <= a && (BigInteger) (s + 1) * (s + 1) > a);
                return s;
            }

            s = FloorSqrt(ref a, s);
            Debug.Assert((BigInteger) s * s <= a && (BigInteger) (s + 1) * (s + 1) > a);
            return s;
        }

        public static ulong CeilingSqrt(UInt256 a)
        {
            if (a.s1 == 0 && a.s0 <= MaxRep)
                return (ulong) Math.Ceiling(Math.Sqrt(a.s0));
            var s = (ulong) Math.Ceiling(Math.Sqrt(ConvertToDouble(ref a)));
            if (a.s1 < MaxRepSquaredHigh)
            {
                Square(out UInt256 s2, s);
                var r = s2.s0 - a.s0;
                if (r > long.MaxValue)
                    ++s;
                else if (r - (s << 1) <= long.MaxValue)
                    --s;
                Debug.Assert((BigInteger) (s - 1) * (s - 1) < a && (BigInteger) s * s >= a);
                return s;
            }

            s = FloorSqrt(ref a, s);
            Square(out UInt256 square, s);
            if (square.S0 != a.S0 || square.S1 != a.S1)
                ++s;
            Debug.Assert((BigInteger) (s - 1) * (s - 1) < a && (BigInteger) s * s >= a);
            return s;
        }

        private static ulong FloorSqrt(ref UInt256 a, ulong s)
        {
            var sprev = (ulong) 0;
            while (true)
            {
                // Equivalent to:
                // snext = (a / s + s) / 2;
                Divide(out UInt256 div, ref a, s);
                Add(out UInt256 sum, ref div, s);
                var snext = sum.S0 >> 1;
                if (sum.S1 != 0)
                    snext |= (ulong) 1 << 63;
                if (snext == sprev)
                {
                    if (snext < s)
                        s = snext;
                    break;
                }

                sprev = s;
                s = snext;
            }

            return s;
        }

        public static ulong FloorCbrt(UInt256 a)
        {
            var s = (ulong) Math.Pow(ConvertToDouble(ref a), (double) 1 / 3);
            Cube(out UInt256 s3, s);
            if (a < s3)
                --s;
            else
            {
                Multiply(out UInt256 sum, 3 * s, s + 1);
                Subtract(out UInt256 diff, ref a, ref s3);
                if (LessThan(ref sum, ref diff))
                    ++s;
            }

            Debug.Assert((BigInteger) s * s * s <= a && (BigInteger) (s + 1) * (s + 1) * (s + 1) > a);
            return s;
        }

        public static ulong CeilingCbrt(UInt256 a)
        {
            var s = (ulong) Math.Ceiling(Math.Pow(ConvertToDouble(ref a), (double) 1 / 3));
            Cube(out UInt256 s3, s);
            if (s3 < a)
                ++s;
            else
            {
                Multiply(out UInt256 sum, 3 * s, s + 1);
                Subtract(out UInt256 diff, ref s3, ref a);
                if (LessThan(ref sum, ref diff))
                    --s;
            }

            Debug.Assert((BigInteger) (s - 1) * (s - 1) * (s - 1) < a && (BigInteger) s * s * s >= a);
            return s;
        }

        public static UInt256 Min(UInt256 a, UInt256 b)
        {
            if (LessThan(ref a, ref b))
                return a;
            return b;
        }

        public static UInt256 Max(UInt256 a, UInt256 b)
        {
            if (LessThan(ref b, ref a))
                return a;
            return b;
        }

        public static double Log(UInt256 a)
        {
            return Log(a, Math.E);
        }

        public static double Log10(UInt256 a)
        {
            return Log(a, 10);
        }

        public static double Log(UInt256 a, double b)
        {
            return Math.Log(ConvertToDouble(ref a), b);
        }

        public static UInt256 Add(UInt256 a, UInt256 b)
        {
            Add(out UInt256 c, ref a, ref b);
            return c;
        }

        public static UInt256 Subtract(UInt256 a, UInt256 b)
        {
            Subtract(out UInt256 c, ref a, ref b);
            return c;
        }

        public static UInt256 Multiply(UInt256 a, UInt256 b)
        {
            Multiply(out UInt256 c, ref a, ref b);
            return c;
        }

        public static UInt256 Divide(UInt256 a, UInt256 b)
        {
            Divide(out UInt256 c, ref a, ref b);
            return c;
        }

        public static UInt256 Remainder(UInt256 a, UInt256 b)
        {
            Remainder(out UInt256 c, ref a, ref b);
            return c;
        }

        public static UInt256 DivRem(UInt256 a, UInt256 b, out UInt256 remainder)
        {
            Divide(out UInt256 c, ref a, ref b);
            Remainder(out remainder, ref a, ref b);
            return c;
        }

        public static UInt256 ModAdd(UInt256 a, UInt256 b, UInt256 modulus)
        {
            ModAdd(out UInt256 c, ref a, ref b, ref modulus);
            return c;
        }

        public static UInt256 ModSub(UInt256 a, UInt256 b, UInt256 modulus)
        {
            ModSub(out UInt256 c, ref a, ref b, ref modulus);
            return c;
        }

        public static UInt256 ModMul(UInt256 a, UInt256 b, UInt256 modulus)
        {
            ModMul(out UInt256 c, ref a, ref b, ref modulus);
            return c;
        }

        public static UInt256 ModPow(UInt256 value, UInt256 exponent, UInt256 modulus)
        {
            ModPow(out UInt256 result, ref value, ref exponent, ref modulus);
            return result;
        }

        public static UInt256 Negate(UInt256 a)
        {
            Negate(out UInt256 c, ref a);
            return c;
        }

        public static UInt256 GreatestCommonDivisor(UInt256 a, UInt256 b)
        {
            GreatestCommonDivisor(out UInt256 c, ref a, ref b);
            return c;
        }

        private static void RightShift64(ref UInt256 c, int d)
        {
            if (d == 0)
                return;
            c.s0 = c.s1 << (64 - d) | c.s0 >> d;
            c.s1 = c.s2 << (64 - d) | c.s1 >> d;
            c.s2 = c.s3 << (64 - d) | c.s2 >> d;
            c.s3 >>= d;
        }

        public static void RightShift(ref UInt256 c, int d)
        {
            int rem = d % 64;
            RightShift64(ref c, rem);
            FullRightShift(ref c, d - rem);
        }

        public static void Shift(ref UInt256 c, int d)
        {
            if (d < 0)
                RightShift(ref c, -d);
            else
                LeftShift(ref c, d);
        }

        public static void ArithmeticShift(ref UInt256 c, int d)
        {
            if (d < 0)
                ArithmeticRightShift(ref c, -d);
            else
                LeftShift(ref c, d);
        }

        public static void RightShift(ref UInt256 c)
        {
            c.s0 = c.s1 << 63 | c.s0 >> 1;
            c.s1 = c.s2 << 63 | c.s1 >> 1;
            c.s2 = c.s3 << 63 | c.s2 >> 1;
            c.s3 >>= 1;
        }

        private static void ArithmeticRightShift64(ref UInt256 c, int d)
        {
            throw new NotImplementedException();
//            if (d == 0)
//                return;
//            c.s0 = c.s1 << (64 - d) | c.s0 >> d;
//            c.s1 = (ulong) ((long) c.s1 >> d);
        }

        public static void ArithmeticRightShift(ref UInt256 c, int d)
        {
            int rem = d % 64;
            RightShift64(ref c, rem);
            FullRightShift(ref c, d - rem);
            c.s3 = (ulong) (long) c.s3;
        }

        public static void ArithmeticRightShift(ref UInt256 c)
        {
            c.s0 = c.s1 << 63 | c.s0 >> 1;
            c.s1 = c.s2 << 63 | c.s1 >> 1;
            c.s2 = c.s3 << 63 | c.s2 >> 1;
            c.s3 = (ulong) ((long) c.s3 >> 1);
        }

        private static void FullLeftShift(ref UInt256 c, int d)
        {
            if (d == 0)
            {
                return;
            }

            if (d == 64)
            {
                c.s3 = c.s2;
                c.s2 = c.s1;
                c.s1 = c.s0;
                c.s0 = 0;
            }
            else if (d == 128)
            {
                c.s3 = c.s1;
                c.s2 = c.s0;
                c.s1 = 0;
                c.s0 = 0;
            }
            else if (d == 192)
            {
                c.s3 = c.s0;
                c.s2 = 0;
                c.s1 = 0;
                c.s0 = 0;
            }
            else
            {
                c.s3 = 0;
                c.s2 = 0;
                c.s1 = 0;
                c.s0 = 0;
            }
        }

        private static void FullRightShift(ref UInt256 c, int d)
        {
            if (d == 0)
            {
                return;
            }

            if (d == 64)
            {
                c.s0 = c.s1;
                c.s1 = c.s2;
                c.s2 = c.s3;
                c.s3 = 0;
            }
            else if (d == 128)
            {
                c.s0 = c.s2;
                c.s1 = c.s3;
                c.s2 = 0;
                c.s3 = 0;
            }
            else if (d == 192)
            {
                c.s0 = c.s3;
                c.s1 = 0;
                c.s2 = 0;
                c.s3 = 0;
            }
            else
            {
                c.s0 = 0;
                c.s1 = 0;
                c.s2 = 0;
                c.s3 = 0;
            }
        }

        private static ulong LeftShift64(ref UInt256 c, int d)
        {
            if (d == 0)
                return 0;
            var dneg = 64 - d;
            var result = c.s3 >> dneg;
            c.s3 = c.s3 << d | c.s2 >> dneg;
            c.s2 = c.s2 << d | c.s1 >> dneg;
            c.s1 = c.s1 << d | c.s0 >> dneg;
            c.s0 <<= d;
            return result;
        }

        public static void LeftShift(ref UInt256 c, int d)
        {
            int rem = d % 64;
            LeftShift64(ref c, rem);
            FullLeftShift(ref c, d - rem);
        }

        public static void LeftShift(ref UInt256 c)
        {
            c.s3 = c.s3 << 1 | c.s2 >> 63;
            c.s2 = c.s2 << 1 | c.s1 >> 63;
            c.s1 = c.s1 << 1 | c.s0 >> 63;
            c.s0 <<= 1;
        }

        public static void Swap(ref UInt256 a, ref UInt256 b)
        {
            (a.s0, b.s0) = (b.s0, a.s0);
            (a.s1, b.s1) = (b.s1, a.s1);
            (a.s2, b.s2) = (b.s2, a.s2);
            (a.s3, b.s3) = (b.s3, a.s3);
        }

        public static void GreatestCommonDivisor(out UInt256 c, ref UInt256 a, ref UInt256 b)
        {
            throw new NotImplementedException();
//            // Check whether one number is > 64 bits and the other is <= 64 bits and both are non-zero.
//            UInt128 a1, b1;
//            if ((a.s1 == 0) != (b.s1 == 0) && !a.IsZero && !b.IsZero)
//            {
//                // Perform a normal step so that both a and b are <= 64 bits.
//                if (LessThan(ref a, ref b))
//                {
//                    a1 = a;
//                    Remainder(out b1, ref b, ref a);
//                }
//                else
//                {
//                    b1 = b;
//                    Remainder(out a1, ref a, ref b);
//                }
//            }
//            else
//            {
//                a1 = a;
//                b1 = b;
//            }
//
//            // Make sure neither is zero.
//            if (a1.IsZero)
//            {
//                c = b1;
//                return;
//            }
//            if (b1.IsZero)
//            {
//                c = a1;
//                return;
//            }
//
//            // Ensure a >= b.
//            if (LessThan(ref a1, ref b1))
//                Swap(ref a1, ref b1);
//
//            // Lehmer-Euclid algorithm.
//            // See: http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.31.693
//            while (a1.s1 != 0 && !b.IsZero)
//            {
//                // Extract the high 63 bits of a and b.
//                var norm = 63 - GetBitLength(a1.s1);
//                UInt128 ahat, bhat;
//                Shift(out ahat, ref a1, norm);
//                Shift(out bhat, ref b1, norm);
//                var uhat = (long)ahat.s1;
//                var vhat = (long)bhat.s1;
//
//                // Check whether q exceeds single-precision.
//                if (vhat == 0)
//                {
//                    // Perform a normal step and try again.
//                    UInt128 rem;
//                    Remainder(out rem, ref a1, ref  b1);
//                    a1 = b1;
//                    b1 = rem;
//                    continue;
//                }
//
//                // Perform steps using signed single-precision arithmetic.
//                var x0 = (long)1;
//                var y0 = (long)0;
//                var x1 = (long)0;
//                var y1 = (long)1;
//                var even = true;
//                while (true)
//                {
//                    // Calculate quotient, cosquence pair, and update uhat and vhat.
//                    var q = uhat / vhat;
//                    var x2 = x0 - q * x1;
//                    var y2 = y0 - q * y1;
//                    var t = uhat;
//                    uhat = vhat;
//                    vhat = t - q * vhat;
//                    even = !even;
//
//                    // Apply Jebelean's termination condition
//                    // to check whether q is valid.
//                    if (even)
//                    {
//                        if (vhat < -x2 || uhat - vhat < y2 - y1)
//                            break;
//                    }
//                    else
//                    {
//                        if (vhat < -y2 || uhat - vhat < x2 - x1)
//                            break;
//                    }
//
//                    // Adjust cosequence history.
//                    x0 = x1; y0 = y1; x1 = x2; y1 = y2;
//                }
//
//                // Check whether a normal step is necessary.
//                if (x0 == 1 && y0 == 0)
//                {
//                    UInt128 rem;
//                    Remainder(out rem, ref a1, ref  b1);
//                    a1 = b1;
//                    b1 = rem;
//                    continue;
//                }
//
//                // Back calculate a and b from the last valid cosequence pairs.
//                UInt128 anew, bnew;
//                if (even)
//                {
//                    AddProducts(out anew, y0, ref b1, x0, ref a1);
//                    AddProducts(out bnew, x1, ref a1, y1, ref b1);
//                }
//                else
//                {
//                    AddProducts(out anew, x0, ref a1, y0, ref b1);
//                    AddProducts(out bnew, y1, ref b1, x1, ref a1);
//                }
//                a1 = anew;
//                b1 = bnew;
//            }
//
//            // Check whether we have any 64 bit work left.
//            if (!b1.IsZero)
//            {
//                var a2 = a1.s0;
//                var b2 = b1.s0;
//
//                // Perform 64 bit steps.
//                while (a2 > uint.MaxValue && b2 != 0)
//                {
//                    var t = a2 % b2;
//                    a2 = b2;
//                    b2 = t;
//                }
//
//                // Check whether we have any 32 bit work left.
//                if (b2 != 0)
//                {
//                    var a3 = (uint)a2;
//                    var b3 = (uint)b2;
//
//                    // Perform 32 bit steps.
//                    while (b3 != 0)
//                    {
//                        var t = a3 % b3;
//                        a3 = b3;
//                        b3 = t;
//                    }
//
//                    Create(out c, a3);
//                }
//                else
//                    Create(out c, a2);
//            }
//            else
//                c = a1;
        }

        private static void AddProducts(out UInt256 result, long x, ref UInt256 u, long y, ref UInt256 v)
        {
            throw new NotImplementedException();
//            // Compute x * u + y * v assuming y is negative and the result is positive and fits in 128 bits.
//            UInt128 product1;
//            Multiply(out product1, ref u, (ulong)x);
//            UInt128 product2;
//            Multiply(out product2, ref v, (ulong)(-y));
//            Subtract(out result, ref product1, ref product2);
        }

        public static int Compare(UInt256 a, UInt256 b)
        {
            return a.CompareTo(b);
        }

        private static byte[] bitLength = Enumerable.Range(0, byte.MaxValue + 1)
            .Select(value =>
            {
                int count;
                for (count = 0; value != 0; count++)
                    value >>= 1;
                return (byte) count;
            }).ToArray();

        private static int GetBitLength(uint value)
        {
            var tt = value >> 16;
            if (tt != 0)
            {
                var t = tt >> 8;
                if (t != 0)
                    return bitLength[t] + 24;
                return bitLength[tt] + 16;
            }
            else
            {
                var t = value >> 8;
                if (t != 0)
                    return bitLength[t] + 8;
                return bitLength[value];
            }
        }

        private static int GetBitLength(ulong value)
        {
            var r1 = value >> 32;
            if (r1 != 0)
                return GetBitLength((uint) r1) + 32;
            return GetBitLength((uint) value);
        }

        public static void Reduce(out UInt256 w, ref UInt256 u, ref UInt256 v, ref UInt256 n, ulong k0)
        {
            throw new NotImplementedException();
//            UInt128 carry;
//            Multiply64(out carry, u.s0, v.s0);
//            var t0 = carry.s0;
//            Multiply64(out carry, u.s1, v.s0, carry.s1);
//            var t1 = carry.s0;
//            var t2 = carry.s1;
//
//            var m = t0 * k0;
//            Multiply64(out carry, m, n.s1, MultiplyHigh64(m, n.s0, t0));
//            Add(ref carry, t1);
//            t0 = carry.s0;
//            Add(out carry, carry.s1, t2);
//            t1 = carry.s0;
//            t2 = carry.s1;
//
//            Multiply64(out carry, u.s0, v.s1, t0);
//            t0 = carry.s0;
//            Multiply64(out carry, u.s1, v.s1, carry.s1);
//            Add(ref carry, t1);
//            t1 = carry.s0;
//            Add(out carry, carry.s1, t2);
//            t2 = carry.s0;
//            var t3 = carry.s1;
//
//            m = t0 * k0;
//            Multiply64(out carry, m, n.s1, MultiplyHigh64(m, n.s0, t0));
//            Add(ref carry, t1);
//            t0 = carry.s0;
//            Add(out carry, carry.s1, t2);
//            t1 = carry.s0;
//            t2 = t3 + carry.s1;
//
//            Create(out w, t0, t1);
//            if (t2 != 0 || !LessThan(ref w, ref n))
//                Subtract(ref w, ref n);
        }

        public static void Reduce(out UInt256 w, ref UInt256 t, ref UInt256 n, ulong k0)
        {
            throw new NotImplementedException();
//            UInt128 carry;
//            var t0 = t.s0;
//            var t1 = t.s1;
//            var t2 = (ulong)0;
//
//            for (var i = 0; i < 2; i++)
//            {
//                var m = t0 * k0;
//                Multiply64(out carry, m, n.s1, MultiplyHigh64(m, n.s0, t0));
//                Add(ref carry, t1);
//                t0 = carry.s0;
//                Add(out carry, carry.s1, t2);
//                t1 = carry.s0;
//                t2 = carry.s1;
//            }
//
//            Create(out w, t0, t1);
//            if (t2 != 0 || !LessThan(ref w, ref n))
//                Subtract(ref w, ref n);
        }

        public static UInt256 Reduce(UInt256 u, UInt256 v, UInt256 n, ulong k0)
        {
            throw new NotImplementedException();
//            UInt128 w;
//            Reduce(out w, ref u, ref v, ref n, k0);
//            return w;
        }

        public static UInt256 Reduce(UInt256 t, UInt256 n, ulong k0)
        {
            throw new NotImplementedException();
//            UInt128 w;
//            Reduce(out w, ref t, ref n, k0);
//            return w;
        }

        public static bool AddWouldOverflow(ref UInt256 a, ref UInt256 b)
        {
            Add(out UInt256 c, ref a, ref b, false);
            return c < a || c < b;
        }
    }
}