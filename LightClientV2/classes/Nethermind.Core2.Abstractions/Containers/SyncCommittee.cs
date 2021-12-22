using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nethermind.Core2.Crypto;
using Nethermind.Core2.Types;

namespace Nethermind.Core2.Containers
{
    public class SyncCommittee
    {
        private readonly BlsPublicKey[] _pubKeys;
        private BlsPublicKey _aggregatePublicKey;

        public SyncCommittee()
        {
            _pubKeys = new BlsPublicKey[(2 << 9) / 2];
            _aggregatePublicKey = BlsPublicKey.Zero;
        }

        public SyncCommittee(BlsPublicKey[] pubKeys, BlsPublicKey aggregatePublicKey)
        {
            _pubKeys = pubKeys;
            _aggregatePublicKey = aggregatePublicKey;
        }

        public BlsPublicKey[] PublicKeys { get { return _pubKeys; } }
        public BlsPublicKey AggregatePublicKey { get { return _aggregatePublicKey; } set { _aggregatePublicKey = value; } }


    }
}
