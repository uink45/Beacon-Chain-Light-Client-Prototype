using System.Diagnostics;
using System.Numerics;
using Nethermind.Dirichlet.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public class UInt64Helper
    {
        public static ulong ModularProduct(ulong a, ulong b, ulong modulus)
        {
            UInt128 product;
            UInt128.Multiply(out product, a, b);
            var c = UInt128.Remainder(ref product, modulus);
            Debug.Assert((BigInteger)a * b % modulus == c);
            return c;
        }

        public static ulong ModularPower(ulong value, ulong exponent, ulong modulus)
        {
            var result = (ulong)1;
            while (exponent != 0)
            {
                if ((exponent & 1) != 0)
                    result = ModularProduct(result, value, modulus);
                if (exponent != 1)
                    value = ModularProduct(value, value, modulus);
                exponent >>= 1;
            }
            return result;
        }

        public static ulong MultiplyHigh(ulong a, ulong b)
        {
            var u0 = (uint)a;
            var u1 = (uint)(a >> 32);
            var v0 = (uint)b;
            var v1 = (uint)(b >> 32);
            var carry = (((ulong)u0 * v0) >> 32) + (ulong)u0 * v1;
            return (((uint)carry + (ulong)u1 * v0) >> 32) + (carry >> 32) + (ulong)u1 * v1;
        }
    }
}
