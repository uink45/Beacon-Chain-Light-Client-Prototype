using System.Collections.Generic;
using Nethermind.HashLib;
using Nethermind.Core2.Containers;
using Nethermind.Core2.Crypto;
namespace LightClientV2
{
    public static class SyncCommitteeExtensions
    {

        public static Root HashTreeRoot(this SyncCommittee item) {
            var tree = new SszTree(new SszContainer(GetValues(item)));
            return new Root(tree.HashTreeRoot());
        }

        public static SszContainer ToSszContainer(this SyncCommittee item)
        {
            return new SszContainer(GetValues(item));
        }

        private static IEnumerable<SszElement> GetValues(SyncCommittee item)
        {
            yield return item.PublicKeys.ToSszVector();
            yield return item.AggregatePublicKey.ToSszBasicVector();
        }
    }
}