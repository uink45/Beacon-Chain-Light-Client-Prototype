using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Nethermind.Decompose.Numerics
{
    public static class BitMatrixHelper
    {
        public static void XorRows(IBitMatrix matrix, int dst, int src, int col)
        {
            for (int j = col; j < matrix.Cols; j++)
                matrix[dst, j] ^= matrix[src, j];
        }

        public static void Clear(IBitMatrix matrix)
        {
            for (int i = 0; i < matrix.Rows; i++)
            {
                for (int j = 0; j < matrix.Cols; j++)
                    matrix[i, j] = false;
            }
        }

        public static void Copy(IBitMatrix matrix, IBitMatrix other, int row, int col)
        {
            for (int i = 0; i < other.Rows; i++)
            {
                for (int j = 0; j < other.Cols; j++)
                    matrix[row + i, col + j] = matrix[i, j];
            }
        }

        public static void CopyNonZero(IBitMatrix matrix, IBitMatrix other)
        {
            if (other.IsRowMajor)
            {
                for (int i = 0; i < other.Rows; i++)
                {
                    foreach (var j in other.GetNonZeroCols(i))
                        matrix[i, j] = true;
                }
            }
            else
            {
                for (int j = 0; j < other.Cols; j++)
                {
                    foreach (var i in other.GetNonZeroRows(j))
                        matrix[i, j] = true;
                }
            }
        }

        public static IEnumerable<bool> GetRow(IBitMatrix matrix, int row)
        {
            for (int j = 0; j < matrix.Cols; j++)
                yield return matrix[row, j];
        }

        public static IEnumerable<int> GetNonZeroCols(IBitMatrix matrix, int row)
        {
            for (int j = 0; j < matrix.Cols; j++)
            {
                if (matrix[row, j])
                    yield return j;
            }
        }

        public static IEnumerable<bool> GetCol(IBitMatrix matrix, int col)
        {
            for (int i = 0; i < matrix.Rows; i++)
                yield return matrix[i, col];
        }

        public static IEnumerable<int> GetNonZeroRows(IBitMatrix matrix, int col)
        {
            for (int i = 0; i < matrix.Rows; i++)
            {
                if (matrix[i, col])
                    yield return i;
            }
        }

        public static int GetRowWeight(IBitMatrix matrix, int row)
        {
            int weight = 0;
            for (int col = 0; col < matrix.Cols; col++)
                weight += matrix[row, col] ? 1 : 0;
            return weight;
        }

        public static int GetColWeight(IBitMatrix matrix, int col)
        {
            int weight = 0;
            for (int row = 0; row < matrix.Rows; row++)
                weight += matrix[row, col] ? 1 : 0;
            return weight;
        }

        public static IEnumerable<int> GetRowWeights(IBitMatrix matrix)
        {
            for (int row = 0; row < matrix.Rows; row++)
                yield return matrix.GetRowWeight(row);
        }

        public static IEnumerable<int> GetColWeights(IBitMatrix matrix)
        {
            for (int col = 0; col < matrix.Cols; col++)
                yield return matrix.GetColWeight(col);
        }
    }
}
