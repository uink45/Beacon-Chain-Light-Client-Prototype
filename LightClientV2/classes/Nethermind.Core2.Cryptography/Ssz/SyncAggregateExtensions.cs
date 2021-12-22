using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nethermind.Core2.Containers;
using Nethermind.Core2.Crypto;
namespace LightClientV2
{
    public static class SyncAggregateExtensions
    {
        public static Root HashTreeRoot(this SyncAggregate item)
        {
            var tree = new SszTree(new SszContainer(GetValues(item)));
            return new Root(tree.HashTreeRoot());
        }

        public static SszContainer ToSszContainer(this SyncAggregate item)
        {
            return new SszContainer(GetValues(item));
        }

        private static IEnumerable<SszElement> GetValues(SyncAggregate item)
        {
            yield return item.SyncCommitteeBits.ToSszBitvector();
            yield return item.SyncCommitteeSignature.ToSszBasicVector();
        }



    }
}
