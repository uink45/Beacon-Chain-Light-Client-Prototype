using Nethermind.Core2.Types;
using Nethermind.Core2.Crypto;

namespace LightClientV2
{
    /// <summary>
    /// Configuration values for each network.
    /// </summary>
    public class Networks
    {
        public ForkVersion[] ForkVersions = { new LightClientUtility().ConvertStringToForkVersion("0x01000000"), new LightClientUtility().ConvertStringToForkVersion("0x01001020") };
        public Root[] GenesisRoots = { new LightClientUtility().ConvertHexStringToRoot("0x4b363db94e286120d76eb905340fdd4e54bfe9f06bf33ff6cf5ad27f511bfe95"), new LightClientUtility().ConvertHexStringToRoot("0x043db0d9a83813551ee2f33450d23797757d430911a9320530ad8a0eabc43efb") };
    }
}
