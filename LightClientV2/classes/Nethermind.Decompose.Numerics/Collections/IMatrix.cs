namespace Nethermind.Decompose.Numerics
{
    public interface IMatrix<T>
    {
        int Rows { get; }
        int Cols { get; }
        T this[int row, int col] { get; set; }
    }
}
