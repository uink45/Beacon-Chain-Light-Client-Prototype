using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Numerics;

namespace Nethermind.Decompose.Numerics
{
    public static partial class IntegerMath
    {
        public static int ModularQuotient(int a, int b, int modulus)
        {
            return ModularProduct(a, ModularInverse(b, modulus), modulus);
        }

        public static uint ModularQuotient(uint a, uint b, uint modulus)
        {
            return ModularProduct(a, ModularInverse(b, modulus), modulus);
        }

        public static long ModularQuotient(long a, long b, long modulus)
        {
            return ModularProduct(a, ModularInverse(b, modulus), modulus);
        }

        public static ulong ModularQuotient(ulong a, ulong b, ulong modulus)
        {
            return ModularProduct(a, ModularInverse(b, modulus), modulus);
        }

        public static BigInteger ModularQuotient(BigInteger a, BigInteger b, BigInteger modulus)
        {
            return ModularProduct(a, ModularInverse(b, modulus), modulus);
        }
    }
}
