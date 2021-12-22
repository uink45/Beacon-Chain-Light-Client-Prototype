#if GNU_MP
// (c) 2008 Witold Bo³t
// License: LGPL v2.1
// www.codeplex.com/gnumpnet

using System;
using System.Runtime.InteropServices;

namespace Gnu.MP
{
    /// <summary>
    /// Wrapper for Gnu MP internal mpf_t data type. Should NOT be used outside!
    /// </summary>
    [StructLayout(LayoutKind.Sequential)]
    internal struct mpf_t
    {
        private int _mp_prec;
        private int _mp_size;
        private int _mp_exp;
        private IntPtr ptr;
    }

    /// <summary>
    /// Floating-point numbers. Wrapper for Gnu MP mpf_t type and mpf_* functions.
    /// </summary>
    public class Real : IComparable<Real>, IComparable, ICloneable
    {
        private mpf_t _pointer;

        #region Constructors
        /// <summary>
        /// Initializes a new instance of the <see cref="Real"/> class with value 0.
        /// </summary>
        public Real()
        {
            mpf_init(ref _pointer);
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Real"/> class with given value.
        /// </summary>
        /// <param name="d">value</param>
        public Real(double d)
        {
            mpf_init_set_d(ref _pointer, d);
        }

        public Real(int i)
        {
            mpf_init_set_si(ref _pointer, i);
        }

        public Real(uint i)
        {
            mpf_init_set_ui(ref _pointer, i);
        }

        public Real(Real r)
        {
            if (ReferenceEquals(null, r))
                throw new NullReferenceException("r couldn't be null!");
            else
                mpf_init_set(ref _pointer, ref r._pointer);
        }

        public Real(Integer i)
        {
            mpf_init(ref _pointer);
            mpf_set_z(ref _pointer, ref i._pointer);
        }

        ~Real()
        {
            mpf_clear(ref _pointer);
        }

        public object Clone()
        {
            return new Real(this);
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Real"/> class with given value and precision.
        /// </summary>
        /// <param name="d">value.</param>
        /// <param name="prec">precision</param>
        public Real(double d, uint prec)
        {
            mpf_init2(ref _pointer, prec);
            mpf_set_d(ref _pointer, d);
        }

        #endregion

        #region Precision

        /// <summary>
        /// Gets or sets the default precision. Value change affects only newly created objects!
        /// </summary>
        /// <value>The default precision.</value>
        public static uint DefaultPrecision
        {
            get { return mpf_get_default_prec(); }
            set { mpf_set_default_prec(value); }
        }

        /// <summary>
        /// Gets or sets the precision of this number.
        /// </summary>
        /// <value>The precision.</value>
        public uint Precision
        {
            get { return mpf_get_prec(ref _pointer); }
            set { mpf_set_prec(ref _pointer, value); }
        }

        #endregion

        #region Conversions
        /// <summary>
        /// Gets the integer value of the number,
        /// </summary>
        /// <value>The int value.</value>
        public int IntValue
        {
            get { return mpf_get_si(ref _pointer); }
        }

        /// <summary>
        /// Gets the double value of the number.
        /// </summary>
        /// <value>The double value.</value>
        public double DoubleValue
        {
            get { return mpf_get_d(ref _pointer); }
        }

        public int CompareTo(Real other)
        {
            return mpf_cmp(ref _pointer, ref other._pointer);
        }

        public int CompareTo(int other)
        {
            return mpf_cmp_si(ref _pointer, other);
        }

        public int CompareTo(double other)
        {
            return mpf_cmp_d(ref _pointer, other);
        }

        public int CompareTo(uint other)
        {
            return mpf_cmp_ui(ref _pointer, other);
        }

        public int CompareTo(object obj)
        {
            if (obj is Real) return CompareTo((Real) obj);
            if (obj is int) return CompareTo((int)obj);
            if (obj is uint) return CompareTo((uint)obj);
            if (obj is double) return CompareTo((double)obj);
            throw new NotSupportedException("This comparison type is not supported!");
        }

        /// <summary>
        /// Returns a <see cref="T:System.String"/> that represents the current <see cref="Real"/> using scientific notation.
        /// </summary>
        /// <param name="num_digits">Maximum number of digits to show.</param>
        /// <returns>A <see cref="T:System.String"/> that represents the current <see cref="Real"/>.</returns>
        public string ToString(int num_digits)
        {
            var exp = 0;
            bool bNegative = false;
            string result = new string(' ', num_digits + 2);
            IntPtr unmanagedResult = Marshal.StringToHGlobalAnsi(result); // allocate UNMANAGED space !
            mpf_get_str(unmanagedResult, ref exp, 10, num_digits, ref _pointer);
            result = Marshal.PtrToStringAnsi(unmanagedResult); // allocate managed string
            Marshal.FreeHGlobal(unmanagedResult); // free unmanaged space
            result = result.Trim(new[] { ' ' });
            if (exp == 0 && result.Equals("")) return "0";
            if (result.StartsWith("-"))
            {
                result = result.TrimStart(new[] { '-' });
                bNegative = true;
            }
            exp--;
            if (0 == result.Substring(1).CompareTo(""))
            {
                result = result.Substring(0, 1);
            }
            else
            {
                result = result.Substring(0, 1) + "." + result.Substring(1);
            }
            if (exp != 0)
            {
                result += "E" + exp;
            }
            if (bNegative)
            {
                result = "-" + result;
            }
            return result;
        }

        public override string ToString()
        {
            int num_digits = (int)((double)Precision / 3.321928094887363d + 20d);
            return ToString(num_digits);
        }

        public static Real Parse(string str)
        {
            Real x = new Real(0, (uint)(str.Length * 3.321928094887363d + 20));
            IntPtr unmanagedString = Marshal.StringToHGlobalAnsi(str); // alloc
            mpf_set_str(ref x._pointer, unmanagedString, 10);
            Marshal.FreeHGlobal(unmanagedString);
            return x;
        }

        public decimal ToDecimal()
        {
            double thisDoubleValue = this.DoubleValue;

            //if (thisDoubleValue > (double)decimal.MaxValue) return decimal.MaxValue;
            //if (thisDoubleValue < (double)decimal.MinValue) return decimal.MinValue;
            if (thisDoubleValue > (double)decimal.MaxValue) throw new System.OverflowException("Real value is out of decimal range.");
            if (thisDoubleValue < (double)decimal.MinValue) throw new System.OverflowException("Real value is out of decimal range.");

            if ((thisDoubleValue < 1.0E-28) && (thisDoubleValue > -1.0E-28)) return decimal.Zero;

            return decimal.Parse(ToString(), System.Globalization.NumberStyles.Any);
        }

        public double Log10ToDouble()
        {
            int num_digits = (int)((double)Precision / 3.321928094887363d + 20d);
            var exp = 0;
            string result = new string(' ', num_digits + 2);
            IntPtr unmanagedResult =  Marshal.StringToHGlobalAnsi(result); // allocate UNMANAGED space !
            mpf_get_str(unmanagedResult, ref exp, 10, num_digits, ref _pointer);
            result = Marshal.PtrToStringAnsi(unmanagedResult); // allocate managed string
            Marshal.FreeHGlobal(unmanagedResult); // free unmanaged space
            result = result.Trim(new[] { ' ' });
            if (result.StartsWith("-"))
            {
                result = "-0." + result.TrimStart(new[] { '-' });
            }
            else
            {
                result = "0." + result;
            }
            return Math.Log10(double.Parse(result)) + exp;
        }

        #endregion

        #region Mandelbrot

        /// <summary>
        /// Mandelbrot calculations, optimized.
        /// Gains a speed factor 3.1 compared to a lazy 'c# with GMP Real' implementation.
        /// 
        /// Calculates:
        /// tmp = 2*x*y + y0
        /// x = x*x - y*y + x0
        /// y = tmp
        /// 
        /// Remarks: All Parameters must be properly created.
        /// 
        /// Example implementation, calculates one pixel:
        /// 
        ///    int iterations = 0;
        ///    Real x0 = new Real(your x coordinate);
        ///    Real y0 = new Real(your y coordinate);
        ///    Real x = new Real(x0);
        ///    Real y = new Real(y0);
        ///    Real temp = new Real();
        /// 
        ///    while ((iterations < maxIterations) && (x.DoubleValue * x.DoubleValue + y.DoubleValue * y.DoubleValue <= 4))
        ///    {
        ///        Real.MandelbrotOperations(ref x, ref y, ref x0, ref y0, ref temp);
        ///        iteration++;
        ///    }
        /// </summary>
        /// <param name="x"></param>
        /// <param name="y"></param>
        /// <param name="x0"></param>
        /// <param name="y0"></param>
        public static void MandelbrotOperations(ref Real x, ref Real y, ref Real x0, ref Real y0, ref Real tmp)
        {
            // t = 2*x*y+y0
            mpf_mul(ref tmp._pointer, ref x._pointer, ref y._pointer);
            mpf_mul_ui(ref tmp._pointer, ref tmp._pointer, (uint)2);
            mpf_add(ref tmp._pointer, ref tmp._pointer, ref y0._pointer);

            // x = x*x - y*y + x0
            mpf_mul(ref y._pointer, ref y._pointer, ref y._pointer);// y = y*y
            mpf_mul(ref x._pointer, ref x._pointer, ref x._pointer);// x = x*x
            mpf_sub(ref x._pointer, ref x._pointer, ref y._pointer);// x = x-y
            mpf_add(ref x._pointer, ref x._pointer, ref x0._pointer);// x = x+x0

            // exchange y and t the FAST way :)
            mpf_t temp_mpf_t = y._pointer;
            y._pointer = tmp._pointer;
            tmp._pointer = temp_mpf_t;
        }

        #endregion

        #region Arithmetic operators

        /// <summary>
        /// Sum of two numbers.
        /// </summary>
        /// <param name="r1">r1</param>
        /// <param name="r2">r2</param>
        /// <returns>r1+r2</returns>
        public static Real operator +(Real r1, Real r2)
        {
            var result = new Real();
            mpf_add(ref result._pointer, ref r1._pointer, ref r2._pointer);
            return result;
        }

        public static Real operator +(Real r1, double r2)
        {
            return r1 + new Real(r2);
        }


        public static Real operator +(Real r1, uint r2)
        {
            var result = new Real();
            mpf_add_ui(ref result._pointer, ref r1._pointer, r2);
            return result;
        }

        public static Real operator +(uint r2, Real r1)
        {
            var result = new Real();
            mpf_add_ui(ref result._pointer, ref r1._pointer, r2);
            return result;
        }

        public static Real operator -(Real r1, Real r2)
        {
            var result = new Real();
            mpf_sub(ref result._pointer, ref r1._pointer, ref r2._pointer);
            return result;
        }

        public static Real operator -(Real r1, uint r2)
        {
            var result = new Real();
            mpf_sub_ui(ref result._pointer, ref r1._pointer, r2);
            return result;
        }

        public static Real operator -(uint r1, Real r2)
        {
            var result = new Real();
            mpf_ui_sub(ref result._pointer, r1, ref r2._pointer);
            return result;
        }

        public static Real operator *(Real r1, Real r2)
        {
            var result = new Real();
            mpf_mul(ref result._pointer, ref r1._pointer, ref r2._pointer);
            return result;
        }

        public static Real operator *(Real r1, double r2)
        {
            return r1*new Real(r2);
        }

        public static Real operator *(Real r1, int r2)
        {
            if (r2 >= 0) return r1*(uint) r2;
            return r1.Negate()*(uint) (-1*r2);
        }


        public static Real Negate(Real r)
        {
            var result = new Real();
            mpf_neg(ref result._pointer, ref r._pointer);
            return result;
        }

        public Real Negate()
        {
            return Negate(this);
        }

        public static Real operator *(Real r1, uint r2)
        {
            var result = new Real();
            mpf_mul_ui(ref result._pointer, ref r1._pointer, r2);
            return result;
        }

        public static Real operator *(uint r2, Real r1)
        {
            var result = new Real();
            mpf_mul_ui(ref result._pointer, ref r1._pointer, r2);
            return result;
        }

        public static Real operator /(Real r1, Real r2)
        {
            var result = new Real();
            mpf_div(ref result._pointer, ref r1._pointer, ref r2._pointer);
            return result;
        }

        public static Real operator /(Real r1, uint r2)
        {
            var result = new Real();
            mpf_div_ui(ref result._pointer, ref r1._pointer, r2);
            return result;
        }

        public static Real operator /(Real r1, int r2)
        {
            if (r2 >= 0) return r1 / (uint) r2;
            return r1.Negate() / (uint) (-1*r2);
        }

        public static Real operator /(uint r1, Real r2)
        {
            var result = new Real();
            mpf_ui_div(ref result._pointer, r1, ref r2._pointer);
            return result;
        }

        public static Real operator++ (Real r)
        {
            return r + 1;
        }

        public static Real operator--(Real r)
        {
            return r - 1;
        }

        public static Real Sqrt(Real r)
        {
            var result = new Real();
            mpf_sqrt(ref result._pointer, ref r._pointer);
            return result;
        }

        public static Real Sqrt(uint i)
        {
            var result = new Real();
            mpf_sqrt_ui(ref result._pointer, i);
            return result;
        }

        public static Real Sqrt(int i)
        {
            if (i >= 0) return Sqrt((uint) i);
            throw new ArgumentOutOfRangeException("i");
        }

        public static Real Pow(Real r, uint i)
        {
            var result = new Real();
            mpf_pow_ui(ref result._pointer, ref r._pointer, i);
            return result;
        }

        public static Real Pow(Real r, int i)
        {
            if (i >= 0) return Pow(r, (uint) i);
            var rr = 1 / r;
            return Pow(rr, (uint) (-1*i));
        }

        public static Real Abs(Real r)
        {
            var result = new Real();
            mpf_abs(ref result._pointer, ref r._pointer);
            return result;
        }

        public Real Abs()
        {
            return Abs(this);
        }

        public static Real Ceiling(Real r)
        {
            var result = new Real();
            mpf_ceil(ref result._pointer, ref r._pointer);
            return result;
        }

        public Real Ceiling()
        {
            return Ceiling(this);
        }

        public static Real Floor(Real r)
        {
            var result = new Real();
            mpf_floor(ref result._pointer, ref r._pointer);
            return result;
        }

        public Real Floor()
        {
            return Floor(this);
        }

        public static Real Trunc(Real r)
        {
            var result = new Real();
            mpf_trunc(ref result._pointer, ref r._pointer);
            return result;
        }

        public Real Trunc()
        {
            return Trunc(this);
        }

        #endregion

        #region Compare

        public static bool operator <(Real op1, Real op2)
        {
            return mpf_cmp(ref op1._pointer, ref op2._pointer) < 0;
        }

        public static bool operator >(Real op1, Real op2)
        {
            return mpf_cmp(ref op1._pointer, ref op2._pointer) > 0;
        }

        public static bool operator >=(Real op1, Real op2)
        {
            return mpf_cmp(ref op1._pointer, ref op2._pointer) >= 0;
        }

        public static bool operator <=(Real op1, Real op2)
        {
            return mpf_cmp(ref op1._pointer, ref op2._pointer) <= 0;
        }

        public static bool operator ==(Real op1, Real op2)
        {
            if (ReferenceEquals(null, op1)) return ReferenceEquals(null, op2);
            if (ReferenceEquals(null, op2)) return ReferenceEquals(null, op1);
            return mpf_cmp(ref op1._pointer, ref op2._pointer) == 0;
        }

        public static bool operator !=(Real op1, Real op2)
        {
            if (ReferenceEquals(null, op1)) return !ReferenceEquals(null, op2);
            if (ReferenceEquals(null, op2)) return !ReferenceEquals(null, op1);
            return mpf_cmp(ref op1._pointer, ref op2._pointer) != 0;
        }

        public static bool operator <(Real op1, double op2)
        {
            return mpf_cmp_d(ref op1._pointer, op2) < 0;
        }

        public static bool operator >(Real op1, double op2)
        {
            return mpf_cmp_d(ref op1._pointer, op2) > 0;
        }

        public static bool operator >=(Real op1, double op2)
        {
            return mpf_cmp_d(ref op1._pointer, op2) >= 0;
        }

        public static bool operator <=(Real op1, double op2)
        {
            return mpf_cmp_d(ref op1._pointer, op2) <= 0;
        }

        public static bool operator ==(Real op1, double op2)
        {
            return mpf_cmp_d(ref op1._pointer, op2) == 0;
        }

        public static bool operator !=(Real op1, double op2)
        {
            return mpf_cmp_d(ref op1._pointer, op2) != 0;
        }

        #endregion


        public static explicit operator Double(Real r)
        {
            return r.DoubleValue;
        }

        public static explicit operator Int32(Real r)
        {
            return r.IntValue;
        }

        public static implicit operator Real(double d)
        {
            return new Real(d);
        }

        public static implicit operator Real(int i)
        {
            return new Real(i);
        }

        public static implicit operator Real(uint i)
        {
            return new Real(i);
        }


        #region DLL imports

        [DllImport("mpir", EntryPoint = "__gmpf_init")]
        private static extern void mpf_init(ref mpf_t ptr);

        [DllImport("mpir", EntryPoint = "__gmpf_init2")]
        private static extern void mpf_init2(ref mpf_t ptr, uint prec);

        [DllImport("mpir", EntryPoint = "__gmpf_clear")]
        private static extern void mpf_clear(ref mpf_t ptr);

        [DllImport("mpir", EntryPoint = "__gmpf_set_default_prec")]
        private static extern void mpf_set_default_prec(uint prec);

        [DllImport("mpir", EntryPoint = "__gmpf_get_default_prec")]
        private static extern uint mpf_get_default_prec();

        [DllImport("mpir", EntryPoint = "__gmpf_get_prec")]
        private static extern uint mpf_get_prec(ref mpf_t ptr);

        [DllImport("mpir", EntryPoint = "__gmpf_set_prec")]
        private static extern void mpf_set_prec(ref mpf_t ptr, uint prec);

        [DllImport("mpir", EntryPoint = "__gmpf_set")]
        private static extern void mpf_set(ref mpf_t rop, ref mpf_t op);

        [DllImport("mpir", EntryPoint = "__gmpf_set_ui")]
        private static extern void mpf_set_ui(ref mpf_t rop, uint op);

        [DllImport("mpir", EntryPoint = "__gmpf_set_si")]
        private static extern void mpf_set_si(ref mpf_t rop, int op);

        [DllImport("mpir", EntryPoint = "__gmpf_set_d")]
        private static extern void mpf_set_d(ref mpf_t rop, double op);

        [DllImport("mpir", EntryPoint = "__gmpf_set_z")]
        private static extern void mpf_set_z(ref mpf_t rop, ref mpz_t op);

        [DllImport("mpir", EntryPoint = "__gmpf_set_q")]
        private static extern void mpf_set_q(ref mpf_t rop, ref mpq_t op);

        [DllImport("mpir", EntryPoint = "__gmpf_set_str")]
        private static extern int mpf_set_str(ref mpf_t rop, IntPtr s, int sbase);

        [DllImport("mpir", EntryPoint = "__gmpf_swap")]
        private static extern int mpf_swap(ref mpf_t rop1, ref mpf_t rop2);

        [DllImport("mpir", EntryPoint = "__gmpf_init_set")]
        private static extern void mpf_init_set(ref mpf_t rop, ref mpf_t op);

        [DllImport("mpir", EntryPoint = "__gmpf_init_set_ui")]
        private static extern void mpf_init_set_ui(ref mpf_t rop, uint op);

        [DllImport("mpir", EntryPoint = "__gmpf_init_set_si")]
        private static extern void mpf_init_set_si(ref mpf_t rop, int op);

        [DllImport("mpir", EntryPoint = "__gmpf_init_set_d")]
        private static extern void mpf_init_set_d(ref mpf_t rop, double op);

        [DllImport("mpir", EntryPoint = "__gmpf_init_set_str")]
        private static extern int mpf_init_set_str(ref mpf_t rop, IntPtr s, int sbase);

        [DllImport("mpir", EntryPoint = "__gmpf_get_d")]
        private static extern double mpf_get_d(ref mpf_t op);

        [DllImport("mpir", EntryPoint = "__gmpf_get_si")]
        private static extern int mpf_get_si(ref mpf_t op);

        [DllImport("mpir", EntryPoint = "__gmpf_get_str")]
        private static extern IntPtr mpf_get_str(IntPtr s, ref int expptr, int sbase, int ndigits, ref mpf_t op);

        [DllImport("mpir", EntryPoint = "__gmpf_add")]
        private static extern void mpf_add(ref mpf_t rop, ref mpf_t op1, ref mpf_t op2);

        [DllImport("mpir", EntryPoint = "__gmpf_add_ui")]
        private static extern void mpf_add_ui(ref mpf_t rop, ref mpf_t op1, uint op2);

        [DllImport("mpir", EntryPoint = "__gmpf_sub")]
        private static extern void mpf_sub(ref mpf_t rop, ref mpf_t op1, ref mpf_t op2);

        [DllImport("mpir", EntryPoint = "__gmpf_sub_ui")]
        private static extern void mpf_sub_ui(ref mpf_t rop, ref mpf_t op1, uint op2);

        [DllImport("mpir", EntryPoint = "__gmpf_ui_sub")]
        private static extern void mpf_ui_sub(ref mpf_t rop, uint op1, ref mpf_t op2);

        [DllImport("mpir", EntryPoint = "__gmpf_mul")]
        private static extern void mpf_mul(ref mpf_t rop, ref mpf_t op1, ref mpf_t op2);

        [DllImport("mpir", EntryPoint = "__gmpf_mul_ui")]
        private static extern void mpf_mul_ui(ref mpf_t rop, ref mpf_t op1, uint op2);

        [DllImport("mpir", EntryPoint = "__gmpf_div")]
        private static extern void mpf_div(ref mpf_t rop, ref mpf_t op1, ref mpf_t op2);

        [DllImport("mpir", EntryPoint = "__gmpf_div_ui")]
        private static extern void mpf_div_ui(ref mpf_t rop, ref mpf_t op1, uint op2);

        [DllImport("mpir", EntryPoint = "__gmpf_ui_div")]
        private static extern void mpf_ui_div(ref mpf_t rop, uint op1, ref mpf_t op2);

        [DllImport("mpir", EntryPoint = "__gmpf_cmp")]
        private static extern int mpf_cmp(ref mpf_t op1, ref mpf_t op2);

        [DllImport("mpir", EntryPoint = "__gmpf_cmp_d")]
        private static extern int mpf_cmp_d(ref mpf_t op1, double op2);

        [DllImport("mpir", EntryPoint = "__gmpf_cmp_si")]
        private static extern int mpf_cmp_si(ref mpf_t op1, int op2);
        
        [DllImport("mpir", EntryPoint = "__gmpf_cmp_ui")]
        private static extern int mpf_cmp_ui(ref mpf_t op1, uint op2);

        [DllImport("mpir", EntryPoint = "__gmpf_ceil")]
        private static extern void mpf_ceil(ref mpf_t rop, ref mpf_t op);
        
        [DllImport("mpir", EntryPoint = "__gmpf_floor")]
        private static extern int mpf_floor(ref mpf_t rop, ref mpf_t op);

        [DllImport("mpir", EntryPoint = "__gmpf_trunc")]
        private static extern int mpf_trunc(ref mpf_t rop, ref mpf_t op);

        [DllImport("mpir", EntryPoint = "__gmpf_integer_p")]
        private static extern int mpf_integer_p(ref mpf_t op);

        [DllImport("mpir", EntryPoint = "__gmpf_sqrt")]
        private static extern void mpf_sqrt(ref mpf_t rop, ref mpf_t op);

        [DllImport("mpir", EntryPoint = "__gmpf_sqrt_ui")]
        private static extern void mpf_sqrt_ui(ref mpf_t rop, uint op);

        [DllImport("mpir", EntryPoint = "__gmpf_pow_ui")]
        private static extern void mpf_pow_ui(ref mpf_t rop, ref mpf_t op1, uint op2);

        [DllImport("mpir", EntryPoint = "__gmpf_abs")]
        private static extern void mpf_abs(ref mpf_t rop, ref mpf_t op);

        [DllImport("mpir", EntryPoint = "__gmpf_neg")]
        private static extern void mpf_neg(ref mpf_t rop, ref mpf_t op);


        #endregion
    }
}
#endif
