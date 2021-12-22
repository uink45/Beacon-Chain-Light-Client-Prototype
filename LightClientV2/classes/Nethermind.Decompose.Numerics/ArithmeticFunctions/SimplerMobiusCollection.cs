using System;
using System.Diagnostics;

namespace Nethermind.Decompose.Numerics
{
    public class SimplerMobiusCollection
    {
        public static int[] GetMu(int max)
        {
            var sqrt = (int)Math.Floor(Math.Sqrt(max));
            var mu = new int[max + 1];
            for (int i = 1; i <= max; i++)
                mu[i] = 1;
            for (int i = 2; i <= sqrt; i++)
            {
                if (mu[i] == 1)
                {
                    for (int j = i; j <= max; j += i)
                        mu[j] *= -i;
                    for (int j = i * i; j <= max; j += i * i)
                        mu[j] = 0;
                }
            }
            for (int i = 2; i <= max; i++)
            {
                if (mu[i] == i)
                    mu[i] = 1;
                else if (mu[i] == -i)
                    mu[i] = -1;
                else if (mu[i] < 0)
                    mu[i] = 1;
                else if (mu[i] > 0)
                    mu[i] = -1;
            }
            return mu;
        }

        public static int[] GetMu1(int max)
        {
            var sqrt = (int)Math.Floor(Math.Sqrt(max));
            var mu = new int[max + 1];
            for (int i = 1; i <= max; i++)
                mu[i] = i;
            for (int i = 2; i <= max; i++)
            {
                if (mu[i] == i)
                {
                    for (int j = i; j <= max; j += i)
                        mu[j] /= -i;
                    if (i <= sqrt)
                    {
                        for (int j = i * i; j <= max; j += i * i)
                            mu[j] = 0;
                    }
                }
            }
            return mu;
        }

        public static int[] GetMu2(int max)
        {
            var sqrt = (int)Math.Floor(Math.Sqrt(max));
            var mu = new int[max + 1];
            for (int i = 1; i <= max; i++)
                mu[i] = i;
            for (int i = 2; i <= sqrt; i++)
            {
                if (mu[i] == i)
                {
                    for (int j = i; j <= max; j += i)
                        mu[j] /= -i;
                    var iSquared = i * i;
                    for (int j = iSquared; j <= max; j += iSquared)
                        mu[j] = 0;
                }
            }
            for (int i = sqrt + 1; i <= max; i++)
            {
                if (mu[i] > 1)
                    mu[i] = -1;
                else if (mu[i] < -1)
                    mu[i] = 1;
            }
            return mu;
        }
    }
}
