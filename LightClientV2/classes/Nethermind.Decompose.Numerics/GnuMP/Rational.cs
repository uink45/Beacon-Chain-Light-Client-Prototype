#if GNU_MP
// (c) 2008 Witold Bołt
// License: LGPL v2.1
// www.codeplex.com/gnumpnet

using System;
using System.Runtime.InteropServices;

namespace Gnu.MP
{
    /// <summary>
    /// Wrapper for GNU MP mpq_t data type. Should NOT be used outside!
    /// </summary>
    [StructLayout(LayoutKind.Sequential)]
    internal struct mpq_t
    {
        private mpz_t _mp_num;
        private mpz_t _mp_den;
    }

    /// <summary>
    /// Rational numbers. Wrapper for mpq_t type and mpq_* functions.
    /// </summary>
    public class Rational: IComparable, IComparable<Rational>, ICloneable
    {
        private mpq_t _pointer;

        public Rational()
        {
            mpq_init(ref _pointer);
        }

        public Rational(double value) : this()
        {
 
            mpq_init(ref _pointer);
            mpq_set_d(ref _pointer, value);

            mpq_canonicalize(ref _pointer);
        }
 
        public Rational(int num) : this(num,(uint)1)
        {
           
        }

        public Rational(int num, uint den) : this()
        {
            mpq_set_si(ref _pointer, num, den);
            mpq_canonicalize(ref _pointer);
        }

        public Rational(uint num, uint den) : this()
        {
            mpq_set_ui(ref _pointer, num, den);
            mpq_canonicalize(ref _pointer);
        }

        public Rational(int num, int den) : this()
        {
            if (den < 0)
            {
                den *= -1;
                num *= -1;
            }

            mpq_set_si(ref _pointer, num, (uint) den);
            mpq_canonicalize(ref _pointer);
        }

        public Rational(Integer num, Integer den):this()
        {
            mpq_set_num(ref _pointer, ref num._pointer);
            mpq_set_den(ref _pointer, ref den._pointer);
            mpq_canonicalize(ref _pointer);
        }

        public Rational(Rational value):this()
        {
            if(ReferenceEquals(value,null)) throw new NullReferenceException("value must not be null!");
            mpq_set(ref _pointer, ref value._pointer);
        }

        public Integer Numerator
        {
            get
            {
                var result = new Integer();
                mpq_get_num(ref result._pointer, ref _pointer);
                return result;
            }
            set
            {
                mpq_set_num(ref _pointer, ref value._pointer);
                mpq_canonicalize(ref _pointer);
            }
        }

        public Integer Denumerator
        {
            get
            {
                var result = new Integer();
                mpq_get_den(ref result._pointer, ref _pointer);
                return result;
            }
            set
            {
                mpq_set_den(ref _pointer, ref value._pointer);
                mpq_canonicalize(ref _pointer);
            }
        }

        ~Rational()
        {
            mpq_clear(ref _pointer);
        }

        public object Clone()
        {
            return new Rational(this);
        }

        public int CompareTo(object obj)
        {
            if (obj is Rational || obj is double || obj is Integer || obj is int || obj is Real) return CompareTo((Rational) obj);
            throw new NotSupportedException("This type of comparison is not supported!");
        }

        public int CompareTo(Rational r)
        {
            return mpq_cmp(ref _pointer, ref r._pointer);
        }

        public static bool operator < (Rational r1, Rational r2)
        {
            return mpq_cmp(ref r1._pointer, ref r2._pointer) < 0;
        }

        public static bool operator <=(Rational r1, Rational r2)
        {
            return mpq_cmp(ref r1._pointer, ref r2._pointer) <= 0;
        }

        public static bool operator >(Rational r1, Rational r2)
        {
            return mpq_cmp(ref r1._pointer, ref r2._pointer) > 0;
        }

        public static bool operator >=(Rational r1, Rational r2)
        {
            return mpq_cmp(ref r1._pointer, ref r2._pointer) >= 0;
        }

        public static bool operator ==(Rational r1, Rational r2)
        {
            return mpq_equal(ref r1._pointer, ref r2._pointer) != 0;
        }

        public static bool operator !=(Rational r1, Rational r2)
        {
            return mpq_equal(ref r1._pointer, ref r2._pointer) == 0;
        }
    
        public static Rational operator +(Rational r1, Rational r2)
        {
            var result = new Rational();
            mpq_add(ref result._pointer, ref r1._pointer, ref r2._pointer);
            return result;
        }

        public static Rational operator ++(Rational r1)
        {
            return r1 + 1;
        }

        public static Rational operator -(Rational r1, Rational r2)
        {
            var result = new Rational();
            mpq_sub(ref result._pointer, ref r1._pointer, ref r2._pointer);
            return result;
        }

        public static Rational operator --(Rational r1)
        {
            return r1 - 1;
        }

        public static Rational operator *(Rational r1, Rational r2)
        {
            var result = new Rational();
            mpq_mul(ref result._pointer, ref r1._pointer, ref r2._pointer);
            return result;
        }

        public static Rational operator /(Rational r1, Rational r2)
        {
            var result = new Rational();
            mpq_div(ref result._pointer, ref r1._pointer, ref r2._pointer);
            return result;
        }

        public Rational Inverse()
        {
            var result = new Rational();
            mpq_inv(ref result._pointer, ref _pointer);
            return result;
        }

        /// <summary>
        /// Performs an explicit conversion from <see cref="System.Double"/> to <see cref="Gnu.MP.Rational"/>.
        /// Use with caution. It's easy to check that even for some "simple" numbers like 0.4 results may suffer
        /// from floating point numbers imperfections (0.4 is NOT 2/5 because double d = 0.4 is not really 0.4!).
        /// </summary>
        /// <param name="d">The d.</param>
        /// <returns>The result of the conversion.</returns>
        public static explicit operator Rational(double d)
        {
           return new Rational(d);
        }


        /// <summary>
        /// Alternative conversion from double to Rational. This may be handy when you need to convert something like
        /// double d = 0.4; into Rational. One would suspect that using Rational r = (Rational)d; give 2/5 but that's
        /// not true, since floating point types couldn't represent decimals accurately (so in fact 0.4 IS NOT 0.4 but
        /// something close to 0.4 and thats why precise conversion to Rational could fool you a bit).
        /// </summary>
        /// <param name="value">value</param>
        /// <returns></returns>
        public static Rational Double2Rational(double value)
        {
            var result = new Rational();

            var s = value.ToString().Split(new char[] { '.' }, 2);

            int denLen = 1;

            if (s.Length == 2)
            {
                denLen = s[1].Length;

            }

            Integer den = (Integer) Math.Pow(10, denLen);
            Integer num = (Int32.Parse(s[0]) * (int) den);

            if (s.Length == 2)
                num += Int32.Parse(s[1]);

            mpq_set_num(ref result._pointer, ref num._pointer);
            mpq_set_den(ref result._pointer, ref den._pointer);
            mpq_canonicalize(ref result._pointer);
            return result;
        }

        public static implicit operator Rational(int i)
        {
            return new Rational(i, 1);
        }

        public static implicit operator Rational(Integer i)
        {
            return new Rational(i, new Integer(1));
        }

        public static explicit operator double(Rational r)
        {
            return mpq_get_d(ref r._pointer);
        }

        public static explicit operator Real(Rational r)
        {
            var num = r.Numerator;
            var den = r.Denumerator;
            var result = new Real(num);
            result /= new Real(den);
            return result;
        }

        public static explicit operator Integer(Rational r)
        {
            var num = r.Numerator;
            var den = r.Denumerator;
            return num/den;
        }

        public override string ToString()
        {
            var str = new string(' ',
                               Integer.mpz_sizeinbase(ref Numerator._pointer, 10) +
                               Integer.mpz_sizeinbase(ref Denumerator._pointer, 10) + 3);

            IntPtr unmanagedString = Marshal.StringToHGlobalAnsi(str); // allocate UNMANAGED space !
            mpq_get_str(unmanagedString, 10, ref _pointer);
            string result = Marshal.PtrToStringAnsi(unmanagedString); // allocate managed string
            Marshal.FreeHGlobal(unmanagedString); // free unmanaged space

            return result;
        }

        public static Rational Abs(Rational r)
        {
            var result = new Rational();
            mpq_abs(ref result._pointer, ref r._pointer);
            return result;
        }

        public Rational Abs()
        {
            return Abs(this);
        }

        public static Rational Sqrt(Rational r)
        {
            var num = r.Numerator.Sqrt();
            var den = r.Denumerator.Sqrt();

            return new Rational(num,den);
            
        }

        public static Rational Pow(Rational r, int j)
        {
            if (j == -1) return r.Inverse();

            var num = j >= 0 ? r.Numerator.Pow(j) : r.Numerator.Pow(-j);
            var den = j >= 0 ? r.Denumerator.Pow(j) : r.Denumerator.Pow(-j);
            return j>=0 ? new Rational(num, den) : new Rational(den,num);
        }

        public Rational Sqrt()
        {
            return Sqrt(this);
        }

        public Rational Pow(int j)
        {
            return Pow(this, j);
        }


        #region DLL imports

        [DllImport("mpir", EntryPoint = "__gmpq_canonicalize")]
        private static extern void mpq_canonicalize(ref mpq_t op);

        // Initialization and Assignment Functions
        [DllImport("mpir", EntryPoint = "__gmpq_init")]
        private static extern void mpq_init(ref mpq_t destrational);

        [DllImport("mpir", EntryPoint = "__gmpq_clear")]
        private static extern void mpq_clear(ref mpq_t rational);

        [DllImport("mpir", EntryPoint = "__gmpq_set")]
        private static extern void mpq_set(ref mpq_t rop, ref mpq_t op);

        [DllImport("mpir", EntryPoint = "__gmpq_set_z")]
        private static extern void mpq_set_z(ref mpq_t rop, ref mpz_t op);

        [DllImport("mpir", EntryPoint = "__gmpq_set_si")]
        private static extern void mpq_set_si(ref mpq_t rop, int num, uint den);

        [DllImport("mpir", EntryPoint = "__gmpq_set_ui")]
        private static extern void mpq_set_ui(ref mpq_t rop, uint num, uint den);

        [DllImport("mpir", EntryPoint = "__gmpq_set_str")]
        private static extern void mpq_set_str(ref mpq_t rop, IntPtr s, int sbase);

        [DllImport("mpir", EntryPoint = "__gmpq_swap")]
        private static extern void mpq_swap(ref mpq_t rop1, ref mpq_t rop2);

        // Conversion Functions
        [DllImport("mpir", EntryPoint = "__gmpq_get_d")]
        private static extern double mpq_get_d(ref mpq_t op);

        [DllImport("mpir", EntryPoint = "__gmpq_set_d")]
        private static extern void mpq_set_d(ref mpq_t rop, double op);

        [DllImport("mpir", EntryPoint = "__gmpq_set_f")]
        private static extern void mpq_set_f(ref mpq_t rop, ref mpf_t op);

        [DllImport("mpir", EntryPoint = "__gmpq_get_str")]
        private static extern IntPtr mpq_get_str(IntPtr s, int sbase, ref mpq_t op);

        // Arithmetic Functions
        [DllImport("mpir", EntryPoint = "__gmpq_add")]
        private static extern void mpq_add(ref mpq_t rop, ref mpq_t op1, ref mpq_t op2);

        [DllImport("mpir", EntryPoint = "__gmpq_sub")]
        private static extern void mpq_sub(ref mpq_t rop, ref mpq_t op1, ref mpq_t op2);

        [DllImport("mpir", EntryPoint = "__gmpq_mul")]
        private static extern void mpq_mul(ref mpq_t rop, ref mpq_t op1, ref mpq_t op2);

        [DllImport("mpir", EntryPoint = "__gmpq_mul_2exp")]
        private static extern void mpq_mul_2exp(ref mpq_t rop, ref mpq_t op1, uint op2);

        [DllImport("mpir", EntryPoint = "__gmpq_div")]
        private static extern void mpq_div(ref mpq_t rop, ref mpq_t op1, ref mpq_t op2);

        [DllImport("mpir", EntryPoint = "__gmpq_div_2exp")]
        private static extern void mpq_div_2exp(ref mpq_t rop, ref mpq_t op1, uint op2);

        [DllImport("mpir", EntryPoint = "__gmpq_neg")]
        private static extern void mpq_neg(ref mpq_t rop, ref mpq_t op);

        [DllImport("mpir", EntryPoint = "__gmpq_abs")]
        private static extern void mpq_abs(ref mpq_t rop, ref mpq_t op);

        [DllImport("mpir", EntryPoint = "__gmpq_inv")]
        private static extern void mpq_inv(ref mpq_t rop, ref mpq_t op);

        // Comparison Functions
        [DllImport("mpir", EntryPoint = "__gmpq_cmp")]
        private static extern int mpq_cmp(ref mpq_t op1, ref mpq_t op2);

        [DllImport("mpir", EntryPoint = "__gmpq_equal")]
        private static extern int mpq_equal(ref mpq_t op1, ref mpq_t op2);

        // Applying Integer Functions to Rationals
        [DllImport("mpir", EntryPoint = "__gmpq_get_num")]
        private static extern void mpq_get_num(ref mpz_t num, ref mpq_t op);

        [DllImport("mpir", EntryPoint = "__gmpq_get_den")]
        private static extern void mpq_get_den(ref mpz_t den, ref mpq_t op);

        [DllImport("mpir", EntryPoint = "__gmpq_set_num")]
        private static extern void mpq_set_num(ref mpq_t rop, ref mpz_t num);

        [DllImport("mpir", EntryPoint = "__gmpq_set_den")]
        private static extern void mpq_set_den(ref mpq_t rop, ref mpz_t den);

        #endregion
    }
}
#endif
