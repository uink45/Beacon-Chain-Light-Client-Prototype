using System;
using Nethermind.Core2.Types;
namespace Lantern
{
    /// <summary>
    /// Constants for the domain types as defined in
    /// https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/beacon-chain.md.
    /// </summary>
    public class SignatureDomains
    {
        public DomainType BeaconAttestor { get; } = new DomainType(new LightClientUtility().StringToByteArray("0x01000000"));
        public DomainType BeaconProposer { get; } = new DomainType(new LightClientUtility().StringToByteArray("0x00000000"));
        public DomainType Deposit { get; } = new DomainType(new LightClientUtility().StringToByteArray("0x03000000"));
        public DomainType Randao { get; } = new DomainType(new LightClientUtility().StringToByteArray("0x02000000"));
        public DomainType VoluntaryExit { get; } = new DomainType(new LightClientUtility().StringToByteArray("0x04000000"));
        public DomainType DomainSelectionProof { get; } = new DomainType(new LightClientUtility().StringToByteArray("0x05000000"));
        public DomainType DomainAggregateAndProof { get; } = new DomainType(new LightClientUtility().StringToByteArray("0x06000000"));
        public DomainType DomainSyncCommittee { get; } = new DomainType(new LightClientUtility().StringToByteArray("0x07000000"));
        public DomainType DomainSyncCommitteeSelectionProof { get; } = new DomainType(new LightClientUtility().StringToByteArray("0x08000000"));
        public DomainType DomainContributionAndProof { get; } = new DomainType(new LightClientUtility().StringToByteArray("0x09000000"));
    }
}
