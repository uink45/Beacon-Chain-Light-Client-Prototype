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
            //using(var db = new LiteDatabase(@"chain_data.db"))
            //{
            //    var headers = db.GetCollection<HeaderDB>("headers");
            //    var header = Stringify(container);
            //    headers.Insert(header);
            //}
        }
    }
}
