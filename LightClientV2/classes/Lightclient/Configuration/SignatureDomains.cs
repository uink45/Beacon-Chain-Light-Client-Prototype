using System;
using Nethermind.Core2.Types;
namespace LightClientV2
{
    public class SignatureDomains
    {
        public SignatureDomains()
        {
            DomainSyncCommittee = new DomainType(GetBytesFromPrefixedString("0x07000000"));
            DomainSyncCommitteeSelectionProof = new DomainType(GetBytesFromPrefixedString("0x08000000"));
            DomainContributionAndProof = new DomainType(GetBytesFromPrefixedString("0x09000000"));
        }

        public DomainType BeaconAttester { get; set; }
        public DomainType BeaconProposer { get; set; }
        public DomainType Deposit { get; set; }
        public DomainType Randao { get; set; }
        public DomainType VoluntaryExit { get; set; }
        public DomainType DomainSyncCommittee { get; set; }
        public DomainType DomainSyncCommitteeSelectionProof { get; set; }
        public DomainType DomainContributionAndProof { get; set; }

        public byte[] GetBytesFromPrefixedString(string hex)
        {
            if (string.IsNullOrWhiteSpace(hex))
            {
                return Array.Empty<byte>();
            }

            var bytes = new byte[(hex.Length - 2) / 2];
            var hexIndex = 2;
            for (var byteIndex = 0; byteIndex < bytes.Length; byteIndex++)
            {
                bytes[byteIndex] = Convert.ToByte(hex.Substring(hexIndex, 2), 16);
                hexIndex += 2;
            }
            return bytes;
        }
    }
}
