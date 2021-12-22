using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Nethermind.Decompose.Numerics
{
    public class GaussianElimination<TArray> : INullSpaceAlgorithm<IBitArray, IBitMatrix>
        where TArray : IBitArray
    {
        private const int multiThreadedCutoff = 256;
        private int threads;

        public GaussianElimination(int threads)
        {
            this.threads = threads != 0 ? threads : 1;
        }

        public IEnumerable<IBitArray> Solve(IBitMatrix matrix)
        {
#if false
            PrintMatrix("initial:", matrix);
#endif
            int rows = Math.Min(matrix.Rows, matrix.Cols);
            int cols = matrix.Cols;
            var c = new int[cols];
            var cInv = new int[cols];
            for (int j = 0; j < cols; j++)
            {
                c[j] = -1;
                cInv[j] = -1;
            }
            for (int k = 0; k < cols; k++)
            {
                int j = -1;
                for (int i = rows - 1; i >= 0; i--)
                {
                    if (c[i] < 0 && matrix[i, k])
                    {
                        j = i;
                        break;
                    }
                }
                if (j != -1)
                {
                    ZeroColumn(matrix, rows, j, k);
                    c[j] = k;
                    cInv[k] = j;
#if false
                    Console.WriteLine("c[{0}] = {1}", j, k);
                    PrintMatrix(string.Format("k = {0}", k), matrix);
#endif
                }
                else
                {
                    var v = (IBitArray)Activator.CreateInstance(typeof(TArray), cols);
                    int ones = 0;
                    for (int jj = 0; jj < cols; jj++)
                    {
                        int s = cInv[jj];
                        bool bit;
                        if (s != -1)
                            bit = matrix[s, k];
                        else if (jj == k)
                            bit = true;
                        else
                            bit = false;
                        v[jj] = bit;
                        if (bit)
                            ++ones;
                    }
#if false
                    Console.WriteLine("k = {0}, v:\n{1}", k, string.Concat(v.Select(bit => bit ? 1 : 0).ToArray()));
#endif
#if DEBUG
                    Debug.Assert(IsSolutionValid(matrix, 0, matrix.Rows, v));

#endif
                    if (IsSolutionValid(matrix, rows, matrix.Rows, v))
                        yield return v;
                }
            }
        }

#if false
        private void ZeroColumn(IBitMatrix matrix, int rows, int j, int k)
        {
            if (threads == 1 || rows < multiThreadedCutoff)
            {
                for (int i = 0; i < rows; i++)
                {
                    if (i != j && matrix[i, k])
                        matrix.XorRows(i, j, k);
                }
                return;
            }
            Parallel.For(0, threads, thread =>
            {
                for (int i = thread; i < rows; i += threads)
                {
                    if (i != j && matrix[i, k])
                        matrix.XorRows(i, j, k);
                }
            });
        }
#else
        private AutoResetEvent signal = new AutoResetEvent(false);

        private void ZeroColumn(IBitMatrix matrix, int rows, int j, int k)
        {
            if (threads == 1 || rows < multiThreadedCutoff)
            {
                for (int i = 0; i < rows; i++)
                {
                    if (i != j && matrix[i, k])
                        matrix.XorRows(i, j, k);
                }
                return;
            }
            signal.Reset();
            int counter = threads;
            for (int thread = 0; thread < threads; thread++)
            {
                ThreadPool.QueueUserWorkItem(delegate(Object o)
                {
                    for (int i = (int)o; i < rows; i += threads)
                    {
                        if (i != j && matrix[i, k])
                            matrix.XorRows(i, j, k);
                    }
                    if (Interlocked.Decrement(ref counter) == 0)
                        signal.Set();
                }, thread);
            }
            signal.WaitOne();
        }
#endif

        public static bool IsSolutionValid(IBitMatrix matrix, IBitArray solution)
        {
            return IsSolutionValid(matrix, 0, matrix.Rows, solution);
        }

        private static bool IsSolutionValid(IBitMatrix matrix, int rowMin, int rowMax, IBitArray solution)
        {
            int cols = matrix.Cols;
            for (int i = rowMin; i < rowMax; i++)
            {
                bool row = false;
                for (int j = 0; j < cols; j++)
                    row ^= solution[j] & matrix[i, j];
                if (row)
                    return false;
            }
            return true;
        }

        private void PrintMatrix(string label, IBitMatrix matrix)
        {
            Console.WriteLine(label);
            for (int i = 0; i < matrix.Rows; i++)
                Console.WriteLine(string.Concat(matrix.GetRow(i).Select(bit => bit ? 1 : 0).ToArray()));
        }
    }
}
