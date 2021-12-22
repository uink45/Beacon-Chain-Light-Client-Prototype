using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;
using System.Diagnostics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        public static int FloorLogBaseTwo(int a)
        {
            return a.GetBitLength() - 1;
        }

        public static int FloorLogBaseTwo(uint a)
        {
            return a.GetBitLength() - 1;
        }

        public static int FloorLogBaseTwo(long a)
        {
            return a.GetBitLength() - 1;
        }

        public static int FloorLogBaseTwo(ulong a)
        {
            return a.GetBitLength() - 1;
        }

        public static int FloorLogBaseTwo(Int128 a)
        {
            return a.GetBitLength() - 1;
        }

        public static int FloorLogBaseTwo(UInt128 a)
        {
            return a.GetBitLength() - 1;
        }

        public static T FloorLogBaseTwo<T>(T a)
        {
            return FloorLog(a, 2);
        }

        public static int CeilingLogBaseTwo(int a)
        {
            return IntegerMath.IsPowerOfTwo(a) ? a.GetBitLength() - 1 : a.GetBitLength();
        }

        public static int CeilingLogBaseTwo(uint a)
        {
            return IntegerMath.IsPowerOfTwo(a) ? a.GetBitLength() - 1 : a.GetBitLength();
        }

        public static int CeilingLogBaseTwo(long a)
        {
            return IntegerMath.IsPowerOfTwo(a) ? a.GetBitLength() - 1 : a.GetBitLength();
        }

        public static int CeilingLogBaseTwo(ulong a)
        {
            return IntegerMath.IsPowerOfTwo(a) ? a.GetBitLength() - 1 : a.GetBitLength();
        }

        public static int CeilingLogBaseTwo(Int128 a)
        {
            return IntegerMath.IsPowerOfTwo(a) ? a.GetBitLength() - 1 : a.GetBitLength();
        }

        public static int CeilingLogBaseTwo(UInt128 a)
        {
            return IntegerMath.IsPowerOfTwo(a) ? a.GetBitLength() - 1 : a.GetBitLength();
        }

        public static T CeilingLogBaseTwo<T>(T a)
        {
            return CeilingLog(a, 2);
        }

        public static T FloorLog<T>(T a, int b)
        {
            var result = (Number<T>)Math.Floor(Number<T>.Log(a, b).Real);
            if (Number<T>.Power(2, result + 1) <= a)
                ++result;
            Debug.Assert(Number<T>.Power(2, result) <= a && Number<T>.Power(2, result + 1) > a);
            return result;
        }

        public static T CeilingLog<T>(T a, int b)
        {
            var result = (Number<T>)Math.Ceiling(Number<T>.Log(a, b).Real);
            if (Number<T>.Power(2, result - 1) >= a)
                --result;
            Debug.Assert(Number<T>.Power(2, result - 1) < a && Number<T>.Power(2, result) >= a);
            return result;
        }

        public static T FloorLog<T>(T a, double b)
        {
            return (Number<T>)Math.Floor(Number<T>.Log(a, b).Real);
        }

        public static T CeilingLog<T>(T a, double b)
        {
            return (Number<T>)Math.Ceiling(Number<T>.Log(a, b).Real);
        }
    }
}
