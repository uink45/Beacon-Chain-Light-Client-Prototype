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
        public DomainType BeaconAttestor { get; } = new LightClientUtility().ToObject("0x01000000", "DomainType");
        public DomainType BeaconProposer { get; } = new LightClientUtility().ToObject("0x00000000", "DomainType");
        public DomainType Deposit { get; } = new LightClientUtility().ToObject("0x03000000", "DomainType");
        public DomainType Randao { get; } = new LightClientUtility().ToObject("0x02000000", "DomainType");
        public DomainType VoluntaryExit { get; } = new LightClientUtility().ToObject("0x04000000", "DomainType");
        public DomainType DomainSelectionProof { get; } = new LightClientUtility().ToObject("0x05000000", "DomainType");
        public DomainType DomainAggregateAndProof { get; } = new LightClientUtility().ToObject("0x06000000", "DomainType");
        public DomainType DomainSyncCommittee { get; } = new LightClientUtility().ToObject("0x07000000", "DomainType");
        public DomainType DomainSyncCommitteeSelectionProof { get; } = new LightClientUtility().ToObject("0x08000000", "DomainType");
        public DomainType DomainContributionAndProof { get; } = new LightClientUtility().ToObject("0x09000000", "DomainType");
    }
}
