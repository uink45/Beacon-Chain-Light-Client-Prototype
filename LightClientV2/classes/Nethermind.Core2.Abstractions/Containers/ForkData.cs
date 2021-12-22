using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nethermind.Core2.Types;
using Nethermind.Core2.Crypto;

namespace Nethermind.Core2.Containers
{
    public class ForkData 
    {
        public ForkData()
        {
            CurrentVersion = ForkVersion.Zero;
            GenesisValidatorsRoot = Root.Zero;
        }
        public ForkData(ForkVersion currentVersion, Root genesisValidatorsRoot)
        {
            CurrentVersion = currentVersion;
            GenesisValidatorsRoot = genesisValidatorsRoot;
        }

        public ForkVersion CurrentVersion { get; }

        public Root GenesisValidatorsRoot { get; }

        
    }
}
