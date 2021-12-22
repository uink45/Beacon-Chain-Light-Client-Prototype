using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nethermind.Core2.Containers;
using Nethermind.Core2.Crypto;
namespace LightClientV2
{
    public static class ForkDataExtensions
    {
        public static Root HashTreeRoot(this ForkData item)
        {
            var tree = new SszTree(new SszContainer(GetValues(item)));
            return new Root(tree.HashTreeRoot());
        }

        private static IEnumerable<SszElement> GetValues(ForkData item)
        {
            yield return item.CurrentVersion.ToSszBasicVector();
            yield return item.GenesisValidatorsRoot.ToSszBasicVector();
        }


    }
}
