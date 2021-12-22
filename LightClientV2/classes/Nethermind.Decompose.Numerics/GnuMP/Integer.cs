#if GNU_MP
// (c) 2008 Witold Bo³t
// License: LGPL v2.1
// www.codeplex.com/gnumpnet

using System;
using System.Numerics;
using System.Runtime.InteropServices;
using System.Security;

namespace Gnu.MP
{
    /// <summary>
    /// Wrapper for internal mpz_t Gnu MP data type. Should NOT be used outside!
    /// </summary>
    [StructLayout(LayoutKind.Sequential)]
    internal struct mpz_t
    {
        private int _mp_alloc;
        private int _mp_size;
        private IntPtr ptr;
    }

    /// <summary>
    /// Memory limited integer numbers. Wrapper for Gnu MP integer mpz_t type with mpz_* functions.
    /// </summary>
    public class Integer : IComparable<Integer>, IComparable<Int32>, IComparable<Double>, IEquatable<Integer>,
                             IConvertible, ICloneable
    {
        internal mpz_t _pointer;

        ~Integer()
        {
            mpz_clear(ref _pointer);
        }

        public object Clone()
        {
            return new Integer(this);
        }

        public Integer()
        {
            mpz_init(ref _pointer);
        }

        public Integer(int value)
        {
            mpz_init_set_si(ref _pointer, value);
        }

        public Integer(Integer value)
        {
            if(ReferenceEquals(value,null)) throw new NullReferenceException("value must not be null!");
            mpz_init(ref _pointer);
            mpz_set(ref _pointer, ref value._pointer);
        }

        public Integer(String value)
        {
            IntPtr unmanagedString = Marshal.StringToHGlobalAnsi(value); // allocate UNMANAGED space !
            mpz_init_set_str(ref _pointer, unmanagedString, 10);
            Marshal.FreeHGlobal(unmanagedString); // free unmanaged space
        }

        public int IntValue
        {
            get { return mpz_get_si(ref _pointer); }
            set { mpz_set_si(ref _pointer, value);}
        }

        public double DoubleValue
        {
            get { return mpz_get_d(ref _pointer); }
        }

        #region IComparable<double> Members

        public int CompareTo(double other)
        {
            return mpz_cmp_d(ref _pointer, other);
        }

        #endregion

        #region IComparable<int> Members

        public int CompareTo(int other)
        {
            return mpz_cmp_si(ref _pointer, other);
        }

        #endregion

        #region IComparable<Integer> Members

        public int CompareTo(Integer other)
        {
            return mpz_cmp(ref _pointer, ref other._pointer);
        }

        #endregion

        #region IEquatable<Integer> Members

        public bool Equals(Integer IntObj)
        {
            if (IntObj == null) return false;
            return mpz_cmp(ref IntObj._pointer, ref this._pointer) == 0;
        }

        #endregion

        public static implicit operator BigInteger(Integer value)
        {
            return BigInteger.Parse(value.ToString());
        }

        public static implicit operator Integer(BigInteger value)
        {
            return Integer.Parse(value.ToString());
        }

        public static implicit operator Integer(int value)
        {
            return new Integer(value);
        }

        public static explicit operator Int32(Integer gi)
        {
            return gi.IntValue;
        }

        public static Integer operator %(Integer op1, Integer mod)
        {
            Integer result = new Integer();
            mpz_mod(ref result._pointer, ref op1._pointer, ref mod._pointer);
            return result;
        }

        public static Integer operator *(Integer op1, Integer op2)
        {
            var result = new Integer();
            mpz_mul(ref result._pointer, ref op1._pointer, ref op2._pointer);
            return result;
        }

        public static Integer operator +(Integer g1, Integer g2)
        {
            var result = new Integer();
            mpz_add(ref result._pointer, ref g1._pointer, ref g2._pointer);
            return result;
        }

        public static Integer operator -(Integer g1, Integer g2)
        {
            var result = new Integer();
            mpz_sub(ref result._pointer, ref g1._pointer, ref g2._pointer);
            return result;
        }

        public static Integer operator /(Integer g1, Integer g2)
        {
            var result = new Integer();
            mpz_tdiv_q(ref result._pointer, ref g1._pointer, ref g2._pointer);
            return result;
        }

        public override string ToString()
        {
            return ToStringInBase(10);
        }

        public static bool operator <(Integer op1, Integer op2)
        {
            return mpz_cmp(ref op1._pointer, ref op2._pointer) < 0;
        }

        public static bool operator >(Integer op1, Integer op2)
        {
            return mpz_cmp(ref op1._pointer, ref op2._pointer) > 0;
        }

        public static bool operator >=(Integer op1, Integer op2)
        {
            return mpz_cmp(ref op1._pointer, ref op2._pointer) >= 0;
        }

        public static bool operator <=(Integer op1, Integer op2)
        {
            return mpz_cmp(ref op1._pointer, ref op2._pointer) <= 0;
        }

        public static bool operator ==(Integer op1, Integer op2)
        {
            return mpz_cmp(ref op1._pointer, ref op2._pointer) == 0;
        }

        public static bool operator !=(Integer op1, Integer op2)
        {
            return mpz_cmp(ref op1._pointer, ref op2._pointer) != 0;
        }

        public static Integer operator ++(Integer op)
        {
            return op + 1;
        }

        public static Integer operator --(Integer op)
        {
            return op - 1;
        }

        #region equality

        public override int GetHashCode()
        {
            return _pointer.GetHashCode();
        }

        public override bool Equals(object obj)
        {
            if (obj == null) return false;
            if (this.GetType() != obj.GetType()) return false;
            Integer IntObj = (Integer)obj; // safe because of the GetType check
            return mpz_cmp(ref IntObj._pointer, ref this._pointer) == 0;
        }

        #endregion

        public static Integer Sqrt(Integer i)
        {
            var result = new Integer();
            mpz_sqrt(ref result._pointer, ref i._pointer);
            return result;
        }

        public Integer Sqrt()
        {
            return Sqrt(this);
        }

        public static Integer FloorSquareRoot(Integer i)
        {
            var result = new Integer();
            mpz_sqrt(ref result._pointer, ref i._pointer);
            return result;
        }

        public static Integer CeilingSquareRoot(Integer i)
        {
            var result = new Integer();
            var rem = new Integer();
            mpz_sqrtrem(ref result._pointer, ref rem._pointer, ref i._pointer);
            return rem == 0 ? result : result + 1;
        }

        public static Integer FloorRoot(Integer i, int root)
        {
            var result = new Integer();
            mpz_root(ref result._pointer, ref i._pointer, root);
            return result;
        }

        public static Integer CeilingRoot(Integer i, int root)
        {
            var result = FloorRoot(i, root);
            return Pow(result, root) == i ? result : result + 1;
        }

        public static Integer Pow(Integer i, uint j)
        {
            var result = new Integer();
            mpz_pow_ui(ref result._pointer, ref i._pointer, j);
            return result;
        }

        public static Integer Pow(Integer i, int j)
        {
            if (j >= 0) return Pow(i, (uint) j);
            throw new ArgumentOutOfRangeException("j");
        }

        public static Integer Pow(uint bas, uint exp)
        {
            var result = new Integer();
            mpz_ui_pow_ui(ref result._pointer, bas, exp);
            return result;
        }

        public Integer PowMod(Integer exp, Integer mod)
        {
            var result = new Integer();
            mpz_powm(ref result._pointer, ref this._pointer, ref exp._pointer, ref mod._pointer);
            return result;
        }
        
        public Integer Pow(int j)
        {
            return Pow(this, j);
        }

        /// <summary>
        /// </summary>
        /// <param name="result"></param>
        /// <param name="op1"></param>
        /// <param name="op2"></param>
        /// <returns>If an inverse doesn’t exist the return value is zero and rop is undefined</returns>
        public static int InverseModulo(Integer result, Integer op1, Integer op2)
        {
            return mpz_invert(ref result._pointer, ref op1._pointer, ref op2._pointer);
        }

        public static Integer Min(Integer a, Integer b)
        {
            return a < b ? a : b;
        }

        public static Integer Max(Integer a, Integer b)
        {
            return a > b ? a : b;
        }

        #region Implementation of IConvertible

        public TypeCode GetTypeCode()
        {
            throw new NotImplementedException();
        }

        public bool ToBoolean(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        public char ToChar(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        public sbyte ToSByte(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        public byte ToByte(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        public short ToInt16(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        public ushort ToUInt16(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        public int ToInt32(IFormatProvider provider)
        {
            return IntValue;
        }

        public uint ToUInt32(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        public long ToInt64(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        public ulong ToUInt64(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        public float ToSingle(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        public double ToDouble(IFormatProvider provider)
        {
            return DoubleValue;
        }

        public decimal ToDecimal(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        public DateTime ToDateTime(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        public string ToString(IFormatProvider provider)
        {
            return ToString();
        }

        public int SizeInBase(int basis)
        {
            return mpz_sizeinbase(ref _pointer, basis);
        }

        /// <summary>
        /// Convert op to a string of digits in base base. The base argument may vary from 2 to 62 or
        /// from ?2 to ?36.
        /// For base in the range 2..36, digits and lower-case letters are used; for ?2..?36, digits and
        /// upper-case letters are used; for 37..62, digits, upper-case letters, and lower-case letters (in
        /// that significance order) are used.
        /// </summary>
        /// <param name="basis"></param>
        /// <returns></returns>
        public string ToStringInBase(int basis)
        {
            var str = new string(' ', mpz_sizeinbase(ref _pointer, (int) Math.Abs(basis)) + 2);
            IntPtr unmanagedString = Marshal.StringToHGlobalAnsi(str); // allocate UNMANAGED space !
            mpz_get_str(unmanagedString, basis, ref _pointer);
            string result = Marshal.PtrToStringAnsi(unmanagedString); // allocate managed string
            Marshal.FreeHGlobal(unmanagedString); // free unmanaged space
            return result;
        }

        public static Integer Parse(String value)
        {
            return ParseInBase(value, 10);
        }

        /// <summary>
        /// White space is allowed in the string, and is simply ignored.
        /// The base may vary from 2 to 62, or if base is 0, then the leading characters are used: 0x and
        /// 0X for hexadecimal, 0b and 0B for binary, 0 for octal, or decimal otherwise.
        /// For bases up to 36, case is ignored; upper-case and lower-case letters have the same value. For
        /// bases 37 to 62, upper-case letter represent the usual 10..35 while lower-case letter represent
        /// 36..61.
        /// </summary>
        /// <param name="value"></param>
        /// <param name="basis"></param>
        /// <returns></returns>
        public static Integer ParseInBase(String value, int basis)
        {
            Integer result = new Integer();
            IntPtr unmanagedString = Marshal.StringToHGlobalAnsi(value); // allocate UNMANAGED space !
            mpz_set_str(ref result._pointer, unmanagedString, basis);
            Marshal.FreeHGlobal(unmanagedString); // free unmanaged space
            return result;
        }

        public object ToType(Type conversionType, IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        #endregion

        #region DLL imports

        [DllImport("mpir", EntryPoint = "__gmpz_init"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_init(ref mpz_t value);

        [DllImport("mpir", EntryPoint = "__gmpz_init_set_si"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_init_set_si(ref mpz_t value, int v);

        [DllImport("mpir", EntryPoint = "__gmpz_init_set_str"),SuppressUnmanagedCodeSecurity]
        private static extern int mpz_init_set_str(ref mpz_t rop, IntPtr s, int basis);

        [DllImport("mpir", EntryPoint = "__gmpz_clear"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_clear(ref mpz_t src);

        [DllImport("mpir", EntryPoint = "__gmpz_mul_si"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_mul_si(ref mpz_t dest, ref mpz_t src, int val);

        [DllImport("mpir", EntryPoint = "__gmpz_mul"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_mul(ref mpz_t dest, ref mpz_t op1, ref mpz_t op2);

        [DllImport("mpir", EntryPoint = "__gmpz_add"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_add(ref mpz_t dest, ref mpz_t src, ref mpz_t src2);

        [DllImport("mpir", EntryPoint = "__gmpz_tdiv_q"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_tdiv_q(ref mpz_t dest, ref mpz_t src, ref mpz_t src2);

        [DllImport("mpir", EntryPoint = "__gmpz_set"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_set(ref mpz_t dest, ref mpz_t src);

        [DllImport("mpir", EntryPoint = "__gmpz_set_si"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_set_si(ref mpz_t src, int value);

        [DllImport("mpir", EntryPoint = "__gmpz_set_str"),SuppressUnmanagedCodeSecurity]
        private static extern int mpz_set_str(ref mpz_t rop, IntPtr s, int sbase);

        [DllImport("mpir", EntryPoint = "__gmpz_get_si"),SuppressUnmanagedCodeSecurity]
        private static extern int mpz_get_si(ref mpz_t src);

        [DllImport("mpir", EntryPoint = "__gmpz_get_d"),SuppressUnmanagedCodeSecurity]
        private static extern double mpz_get_d(ref mpz_t src);

        [DllImport("mpir", EntryPoint = "__gmpz_get_str", CharSet = CharSet.Ansi),SuppressUnmanagedCodeSecurity]
        private static extern IntPtr mpz_get_str(IntPtr out_string, int _base, ref mpz_t src);

        [DllImport("mpir", EntryPoint = "__gmpz_sizeinbase"),SuppressUnmanagedCodeSecurity]
        internal static extern int mpz_sizeinbase(ref mpz_t src, int _base);

        [DllImport("mpir", EntryPoint = "__gmpz_cmp"),SuppressUnmanagedCodeSecurity]
        private static extern int mpz_cmp(ref mpz_t op1, ref mpz_t op2);

        [DllImport("mpir", EntryPoint = "__gmpz_cmp_d"),SuppressUnmanagedCodeSecurity]
        private static extern int mpz_cmp_d(ref mpz_t op1, double op2);

        [DllImport("mpir", EntryPoint = "__gmpz_cmp_si"),SuppressUnmanagedCodeSecurity]
        private static extern int mpz_cmp_si(ref mpz_t op1, int op2);

        [DllImport("mpir", EntryPoint = "__gmpz_sub"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_sub(ref mpz_t rop, ref mpz_t op1, ref mpz_t op2);

        [DllImport("mpir", EntryPoint = "__gmpz_sqrt"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_sqrt(ref mpz_t rop, ref mpz_t op);

        [DllImport("mpir", EntryPoint = "__gmpz_sqrtrem"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_sqrtrem(ref mpz_t rop, ref mpz_t rem, ref mpz_t op);

        [DllImport("mpir", EntryPoint = "__gmpz_root"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_root(ref mpz_t rop, ref mpz_t op, int root);

        [DllImport("mpir", EntryPoint = "__gmpz_pow_ui"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_pow_ui(ref mpz_t rop, ref mpz_t op, uint exp);

        [DllImport("mpir", EntryPoint = "__gmpz_powm"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_powm(ref mpz_t rop, ref mpz_t bas, ref mpz_t exp, ref mpz_t mod);

        [DllImport("mpir", EntryPoint = "__gmpz_mod"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_mod(ref mpz_t rop, ref mpz_t op1, ref mpz_t mod);

        [DllImport("mpir", EntryPoint = "__gmpz_ui_pow_ui"),SuppressUnmanagedCodeSecurity]
        private static extern void mpz_ui_pow_ui(ref mpz_t rop, uint bas, uint exp);

        [DllImport("mpir", EntryPoint = "__gmpz_invert"),SuppressUnmanagedCodeSecurity]
        private static extern int mpz_invert(ref mpz_t rop, ref mpz_t op1, ref mpz_t op2);

        #endregion


    }
}
#endif
