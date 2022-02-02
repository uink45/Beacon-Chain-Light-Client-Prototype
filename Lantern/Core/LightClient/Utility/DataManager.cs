using System.IO;
using Newtonsoft.Json;

namespace Lantern
{
    public class DataManager
    {
        private string path = "Storage";
        private string fileName = "chain_data.txt";
        public DataManager()
        {
            FileInfo fi = new FileInfo(path + @"\" + fileName);
            DirectoryInfo di = new DirectoryInfo(path);
            if (!di.Exists)
            {
                di.Create();
            }

            if (!fi.Exists)
            {
                fi.Create().Dispose();
            }
        }

        public void StoreData(LightClientStore container)
        {
            using (FileStream aFile = new FileStream(path + @"\" + fileName, FileMode.Append, FileAccess.Write))

            using (StreamWriter sw = new StreamWriter(aFile))
            {
                var data = JsonConvert.SerializeObject(Stringify(container));
                sw.WriteLine(data);
            }
        }

        public StoreObject.FinalizedHeader Stringify(LightClientStore container)
        {
            StoreObject.FinalizedHeader finalizedHeader = new StoreObject.FinalizedHeader();
            finalizedHeader.slot = container.FinalizedHeader.Slot.ToString();
            finalizedHeader.proposer_index = container.FinalizedHeader.ValidatorIndex.ToString();
            finalizedHeader.block_root = container.FinalizedHeader.HashTreeRoot().ToString();
            finalizedHeader.parent_root = container.FinalizedHeader.ParentRoot.ToString();
            finalizedHeader.state_root = container.FinalizedHeader.StateRoot.ToString();
            finalizedHeader.body_root = container.FinalizedHeader.BodyRoot.ToString();

            return finalizedHeader;
        }
    }
}
