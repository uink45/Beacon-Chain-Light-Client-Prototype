using Nethermind.Core2.Types;

namespace LightClientV2
{
    public class NetworkConstants
    {
        public ulong GossipMaxSize { get; } = 1048576;
        public ulong MaxRequestBlocks { get; } = 1024;
        public int MinEpochsForBlockRequests { get; } = 33024;
        public ulong MaxChunkSize { get; } = 1048576;
        public int TTFBTimeout { get; } = 5;
        public int RESPTimeout { get; } = 10;
        public int AttestationSubnetCount { get; } = 64;
        public int AttestationPropagationSlotRange { get; } = 32;
        public int MaximumGossipClockDisparity { get; } = 500;
        public DomainType MessageDomainInvalidSnappy { get; } = new DomainType(new LightClientUtility().StringToByteArray("0x00000000"));
        public DomainType MessageDomainValidSnappy { get; } = new DomainType(new LightClientUtility().StringToByteArray("0x01000000"));
    }
}
