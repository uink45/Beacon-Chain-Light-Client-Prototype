using System;
using System.Diagnostics;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class UInt64Division0 : IDivisionAlgorithm<ulong, uint>
    {
        private uint d;

        public uint Divisor
        {
            get { return d; }
        }

        public UInt64Division0(uint d)
        {
            this.d = d;
        }

        public ulong Divide(ulong k)
        {
            return k / d;
        }

        public uint Modulus(ulong k)
        {
            return (uint)(k % d);
        }

        public bool IsDivisible(ulong k)
        {
            return k % d == 0;
        }
    }

    public class UInt64Division1 : IDivisionAlgorithm<ulong, uint>
    {
        private const int n = 64;
        private uint d;
        private ulong m;
        private int sh1;
        private int sh2;

        public uint Divisor
        {
            get { return d; }
        }

        public UInt64Division1(uint d)
        {
            this.d = d;
            var l = d.GetBitLength();
            m = (ulong)(((((UInt128)1 << l) - d) << n) / d + 1);
            sh1 = Math.Min(l, 1);
            sh2 = Math.Max(l - 1, 0);
        }

        public ulong Divide(ulong k)
        {
            var t = UInt64Helper.MultiplyHigh(m, k);
            return (((k - t) >> sh1) + t) >> sh2;
        }

        public uint Modulus(ulong k)
        {
            var t = UInt64Helper.MultiplyHigh(m, k);
            return (uint)(k - ((((k - t) >> sh1) + t) >> sh2) * d);
        }

        public bool IsDivisible(ulong k)
        {
            return Modulus(k) == 0;
        }
    }

    public class UInt64Division2 : IDivisionAlgorithm<ulong, uint>
    {
        private const int n = 64;
        private const int sh1 = 1;
        private uint d;
        private ulong mPrime;
        private int sh2;

        public uint Divisor
        {
            get { return d; }
        }

        public UInt64Division2(uint d)
        {
            if (d == 1)
                throw new NotImplementedException("division by one not implemented");
            this.d = d;
            var l = d.GetBitLength();
            mPrime = (ulong)(((((UInt128)1 << l) - d) << n) / d + 1);
            sh2 = l - 1;
        }

        public ulong Divide(ulong k)
        {
            var t = UInt64Helper.MultiplyHigh(mPrime, k);
            return (((k - t) >> sh1) + t) >> sh2;
        }

        public uint Modulus(ulong k)
        {
            var t = UInt64Helper.MultiplyHigh(mPrime, k);
            return (uint)(k - ((((k - t) >> sh1) + t) >> sh2) * d);
        }

        public bool IsDivisible(ulong k)
        {
            return Modulus(k) == 0;
        }
    }

    public class UInt64Division3 : IDivisionAlgorithm<ulong, uint>
    {
        private ulong recip;
        private uint d;

        public uint Divisor
        {
            get { return d; }
        }

        public UInt64Division3(uint d)
        {
            this.d = d;
            var m = ((UInt128)1 << 64) / d + 1;
            recip = (ulong)m;
            Debug.Assert((BigInteger)m <= ulong.MaxValue);
            Debug.Assert((BigInteger)m * d >= ((BigInteger)1 << 42));
            Debug.Assert((BigInteger)m * d <= ((BigInteger)1 << 42) + (BigInteger)1 << 22);
        }

        public ulong Divide(ulong k)
        {
            return UInt64Helper.MultiplyHigh(recip, k);
        }

        public uint Modulus(ulong k)
        {
            return (uint)(k - Divide(k) * d);
        }

        public bool IsDivisible(ulong k)
        {
            return Modulus(k) == 0;
        }
    }

    public class UInt64Division4 : IDivisionAlgorithm<ulong, uint>
    {
        private ulong mPrime;
        private int shift;
        private uint d;

        public uint Divisor
        {
            get { return d; }
        }

        public UInt64Division4(uint d)
        {
            this.d = d;
            var l = d.GetBitLength();
            var m = ChooseMultiplier(d, l, l + 32, l + 32, 64, out shift);
            if (shift < 0)
                Debugger.Break();
            if (m > ulong.MaxValue)
                throw new NotImplementedException("multiplier too large");
            mPrime = (ulong)m;
        }

        public ulong Divide(ulong k)
        {
            return UInt64Helper.MultiplyHigh(mPrime, k) >> shift;
        }

        public uint Modulus(ulong k)
        {
            return (uint)(k - (UInt64Helper.MultiplyHigh(mPrime, k) >> shift) * d);
        }

        public bool IsDivisible(ulong k)
        {
            return Modulus(k) == 0;
        }

        private static UInt128 ChooseMultiplier(uint d, int l, int n, int precision, int shiftFixed, out int shiftPost)
        {
            if (n + l - shiftFixed < 0)
                l = shiftFixed - n;
            shiftPost = n + l - shiftFixed;
            var mLow = ((UInt128)1 << (n + l)) / d;
            var mHigh = (((UInt128)1 << (n + l)) + ((UInt128)1 << (n + l - precision))) / d;
            while (mLow >> 1 < mHigh >> 1 && shiftPost > 0)
            {
                mLow >>= 1;
                mHigh >>= 1;
                --shiftPost;
            }
            return mHigh;
        }
    }

    public class UInt64Division5 : IDivisionAlgorithm<ulong, uint>
    {
        private uint dInv;
        private uint qmax;
        private uint d;

        public uint Divisor
        {
            get { return d; }
        }

        public UInt64Division5(uint d)
        {
            Debug.Assert(d % 2 == 0);
            this.d = d;
            this.dInv = IntegerMath.ModularInversePowerOfTwoModulus(d, 32);
            this.qmax = uint.MaxValue / d;
        }

        public ulong Divide(ulong k)
        {
            return k / d;
        }

        public uint Modulus(ulong k)
        {
            return (uint)(k % d);
        }

        public bool IsDivisible(ulong k)
        {
            return dInv * k <= qmax;
        }
    }
}
