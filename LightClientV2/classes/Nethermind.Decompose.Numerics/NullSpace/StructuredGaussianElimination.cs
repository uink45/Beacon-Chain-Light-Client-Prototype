using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Nethermind.Decompose.Numerics
{
    public class StructuredGaussianElimination<TArray, TMatrix> : INullSpaceAlgorithm<IBitArray, IBitMatrix>
        where TArray : IBitArray
        where TMatrix : IBitMatrix
    {
        private class Ancestor
        {
            public int Column { get; set; }
            public Ancestor Next { get; set; }
        }

        private const int multiThreadedCutoff = 256;
        private const int mergeLimitDefault = 5;
        private int threads;
        private int mergeLimit;
        private bool diagnostics;
        private Stopwatch timer;
        private INullSpaceAlgorithm<IBitArray, IBitMatrix> solver;

        private int colsOrig;
        private IBitMatrix matrix;
        private Ancestor[] ancestors;

#if DEBUG
        private IBitMatrix matrixOrig;
#endif

        public StructuredGaussianElimination(int threads, bool diagnostics)
            : this(threads, 0, diagnostics)
        {
        }

        public StructuredGaussianElimination(int threads, int mergeLimit, bool diagnostics)
        {
            this.threads = threads != 0 ? threads : 1;
            this.mergeLimit = mergeLimit != 0 ? mergeLimit : mergeLimitDefault;
            this.diagnostics = diagnostics;
            this.solver = new GaussianElimination<TArray>(threads);
        }

        public IEnumerable<IBitArray> Solve(IBitMatrix matrix)
        {
#if DEBUG
            matrixOrig = (IBitMatrix)Activator.CreateInstance(typeof(TMatrix), matrix);
#endif

            if (diagnostics)
            {
                Console.WriteLine("original matrix: {0} rows, {1} cols", matrix.Rows, matrix.Cols);
                Console.WriteLine("merge limit = {0}", mergeLimit);
                timer = new Stopwatch();
                timer.Restart();
            }

            if (matrix.Rows < 1000)
            {
                foreach (var v in solver.Solve((IBitMatrix)Activator.CreateInstance(typeof(TMatrix), matrix)))
                    yield return v;
                yield break;
            }

            colsOrig = matrix.Cols;
            this.matrix = matrix;
            var compactMatrix = CompactMatrix();
            if (diagnostics)
            {
                Console.WriteLine("compaction: {0:F3} msec", (double)timer.ElapsedTicks / Stopwatch.Frequency * 1000);
                Console.WriteLine("matrix compacted: {0} rows, {1} cols", compactMatrix.Rows, compactMatrix.Cols);
            }
            foreach (var v in solver.Solve(compactMatrix))
                yield return GetOriginalSolution(v);
        }

        private IBitArray GetOriginalSolution(IBitArray w)
        {
            var v = (IBitArray)Activator.CreateInstance(typeof(TArray), colsOrig);
            for (int i = 0; i < w.Length; i++)
            {
                if (w[i])
                {
                    for (var ancestor = ancestors[i]; ancestor != null; ancestor = ancestor.Next)
                        v[ancestor.Column] = !v[ancestor.Column];
                }
            }
#if DEBUG
            Debug.Assert(GaussianElimination<TArray>.IsSolutionValid(matrixOrig, v));
#endif
            return v;
        }

        private IBitMatrix CompactMatrix()
        {
            var deletedRows = new bool[matrix.Rows];
            var deletedCols = new bool[matrix.Cols];
            ancestors = new Ancestor[matrix.Cols];
            for (int i = 0; i < matrix.Cols; i++)
                ancestors[i] = new Ancestor { Column = i };
            if (diagnostics)
                Console.WriteLine("initial density = {0:F3}/col", (double)matrix.GetRowWeights().Sum() / matrix.Rows);

            int surplusCols = 0;
            int pass = 1;
            while (true)
            {
                int deleted = 0;
                for (int n = matrix.Rows - 1; n >= 0; n--)
                {
                    if (deletedRows[n])
                        continue;
                    var weight = matrix.GetRowWeight(n);

                    // Delete entirely empty rows.
                    if (weight == 0)
                    {
                        deletedRows[n] = true;
                        ++surplusCols;
                        ++deleted;
                        continue;
                    }
                    
                    // Delete rows with a single non-zero entry.
                    if (weight == 1)
                    {
                        var col = matrix.GetNonZeroCols(n).First();
                        deletedRows[n] = true;
                        MergeColumns(col);
                        deletedCols[col] = true;
                        ++deleted;
                        continue;
                    }

                    // Use surplus rows to bring weight down to merge limit.
                    int limit = Math.Min(pass, mergeLimit);
                    if (weight > limit && surplusCols > 0 && weight - surplusCols <= limit)
                    {
                        while (weight > limit)
                        {
                            var col = matrix.GetNonZeroCols(n)
                                .OrderByDescending(index => matrix.GetColWeight(index))
                                .First();
                            MergeColumns(col);
                            deletedCols[col] = true;
                            ++deleted;
                            --surplusCols;
                            --weight;
                        }
                    }

                    // Merge low weight rows.
                    if (weight <= limit)
                    {
                        var cols = matrix.GetNonZeroCols(n)
                            .OrderByDescending(index => matrix.GetColWeight(index))
                            .ToArray();
                        Debug.Assert(cols.Length == weight);
                        var srcCol = cols[0];
                        MergeColumns(cols);
                        for (var ancestor = ancestors[srcCol]; ancestor != null; ancestor = ancestor.Next)
                        {
                            for (int j = 1; j < weight; j++)
                                ancestors[cols[j]] = new Ancestor { Column = ancestor.Column, Next = ancestors[cols[j]] };
                        }
                        deletedRows[n] = true;
                        ancestors[srcCol] = null;
                        deletedCols[srcCol] = true;
                        ++deleted;
                        continue;
                    }
                }

                if (diagnostics)
                    Console.WriteLine("pass {0}: deleted {1} rows", pass, deleted);
                if (deleted == 0)
                    break;
                ++pass;
            }

            // Compute mapping between original matrix and compact matrix.
            ancestors = deletedCols
                .Select((deleted, index) => deleted ? null : ancestors[index])
                .Where(ancestor => ancestor != null)
                .ToArray();
            var rowMap = deletedRows
                .Select((deleted, index) => deleted ? -1 : index)
                .Where(index => index != -1)
                .ToArray();
            var colMap = deletedCols
                .Select((deleted, index) => deleted ? -1 : index)
                .Where(index => index != -1)
                .ToArray();

            // Permute columns to sort by increasing column weight.
            var order = Enumerable.Range(0, colMap.Length)
                .OrderBy(index => matrix.GetColWeight(colMap[index]))
                .ToArray();
            ancestors = Enumerable.Range(0, colMap.Length)
                .Select(index => ancestors[order[index]])
                .ToArray();
            colMap = Enumerable.Range(0, colMap.Length)
                .Select(index => colMap[order[index]])
                .ToArray();

            // Create compact matrix.
            var revColMap = new int[matrix.Cols];
            for (int i = 0; i < colMap.Length; i++)
                revColMap[colMap[i]] = i;
            var compactMatrix = (IBitMatrix)Activator.CreateInstance(typeof(TMatrix), rowMap.Length, colMap.Length);
            for (int i = 0; i < rowMap.Length; i++)
            {
                int row = rowMap[i];
                foreach (var col in matrix.GetNonZeroCols(row))
                    compactMatrix[i, revColMap[col]] = true;
            }

            if (diagnostics)
            {
                Console.WriteLine("completed compaction in {0} passes", pass);
                Console.WriteLine("final density = {0:F3}/col", (double)matrix.GetRowWeights().Sum() / compactMatrix.Rows);
            }

            return compactMatrix;
        }

        public void MergeColumns(params int[] colIndices)
        {
            int rows = matrix.Rows;
            int cols = colIndices.Length;
            int srcCol = colIndices[0];
            foreach (var i in matrix.GetNonZeroRows(srcCol).ToArray())
            {
                for (int j = 1; j < cols; j++)
                {
                    int col = colIndices[j];
                    var old = matrix[i, col];
                    matrix[i, col] = !old;
                }

                matrix[i, srcCol] = false;
            }
        }
    }
}
