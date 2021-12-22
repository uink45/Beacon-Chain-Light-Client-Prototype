using System;

namespace LightClientV2
{
    internal class SerializeResult
    {
        public SerializeResult(ReadOnlySpan<byte> bytes, bool isVariableSize)
        {
            Bytes = bytes.ToArray();
            IsVariableSize = isVariableSize;
        }

        public byte[] Bytes { get; }

        public bool IsVariableSize { get; }
    }
}
