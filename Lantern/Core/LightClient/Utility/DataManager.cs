using LiteDB;
using System;
using Nethermind.Core2.Types;
using Nethermind.Core2.Containers;
using Nethermind.Core2.Crypto;

namespace Lantern
{
    public class DataManager
    {

        public void StoreData(BeaconBlockHeader container)
        {
            using(var db = new LiteDatabase(@"chain_data.db"))
            {
                var headers = db.GetCollection<HeaderDB>("headers");
                var header = Stringify(container);
                headers.Insert(header);
            }
        }

        private HeaderDB Stringify(BeaconBlockHeader container)
        {
            HeaderDB header = new HeaderDB();
            header.slot = container.Slot.ToString();
            header.proposer_index = container.ValidatorIndex.ToString();
            header.block_root = container.HashTreeRoot().ToString();
            header.parent_root = container.ParentRoot.ToString();
            header.state_root = container.StateRoot.ToString();
            header.body_root = container.BodyRoot.ToString();
            return header;
        }
    }
}
