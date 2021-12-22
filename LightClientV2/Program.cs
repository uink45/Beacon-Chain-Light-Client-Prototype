using System;
using System.Net.Http;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Windows.Forms;
using System.Threading.Tasks;

namespace LightClientV2
{
    public class Program 
    {   
        public static LightClientFunctions Client;
        public static SerializeSnapshot Snapshot;
        public static RetrieveData GetData;
        public static LightClientUtility Utility;
        public static LocalClock Clock;
        public static Server Server; 

        public static void InitializeObjects()
        {
            Client = new LightClientFunctions();
            Utility = new LightClientUtility();
            Clock = new LocalClock();
            Server = new Server();
            GetData = new RetrieveData();
            Snapshot = new SerializeSnapshot();
        }

        public static async Task Main(string[] args)
        {
            InitializeObjects();
            await InitializeFromTrustedCheckpointRoot();
            await FetchUpdates();
        }

        public static async Task InitializeFromTrustedCheckpointRoot()
        {
            Console.Clear();
            Console.WriteLine("Initiailizing From Finality Checkpoint Root...");
            string checkpointRoot = Server.FetchLatestFinalizedChekpoint();
            string text = await Server.FetchSnapshot(checkpointRoot);
            text = text.Insert(8, "[");
            text = text.Insert(text.Length - 1, "]");
            Snapshot.Contents = GetData.ParseSnapshot(text);
            Client.ValidateCheckpoint(checkpointRoot, Snapshot.InitializeSnapshot());

            Console.WriteLine("\nSuccessfully Initialized!");
            Console.WriteLine("\nLatest Synced Header");
            Console.WriteLine("======================");
            Console.WriteLine("Slot - " + Client.storage.BestValidUpdate.AttestedHeader.Slot.ToString());
            Console.WriteLine("Validator Index - " + Client.storage.BestValidUpdate.AttestedHeader.ValidatorIndex.ToString());
            Console.WriteLine("Block Root - " + Client.storage.BestValidUpdate.AttestedHeader.HashTreeRoot().ToString());
            Console.WriteLine("Parent Root - " + Client.storage.BestValidUpdate.AttestedHeader.ParentRoot.ToString());
            Console.WriteLine("State Root - " + Client.storage.BestValidUpdate.AttestedHeader.StateRoot.ToString());
            Console.WriteLine("Body Root - " + Client.storage.BestValidUpdate.AttestedHeader.BodyRoot.ToString());
        }

        public static async Task FetchUpdates()
        {
            Console.WriteLine("\nStarted Tracking Header...");
            HttpClient client = new HttpClient();
            client.Timeout = TimeSpan.FromSeconds(30);
            string url = $"https://eth2-beacon-mainnet.infura.io/eth/v2/beacon/blocks/head";
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes("21qajKWbOdMuXWCCPEbxW1bVPrp:5e43bc9d09711d4f34b55077cdb3380a");
            string val = System.Convert.ToBase64String(plainTextBytes);
            client.DefaultRequestHeaders.Add("Authorization", "Basic " + val);
            while (true)
            {
                try
                {
                    List<string> contents = new List<string>();
                    string content = string.Empty;
                    using (var streamReader = new StreamReader(await client.GetStreamAsync(url)))
                    {
                        content = streamReader.ReadToEnd();
                    }
                    contents.Add(content);
                    
                    LightClientUpdate update = Server.SerializeContent(contents);
                    await Task.Delay(11900);
                    if (update != null)
                    {
                        Client.ProcessLightClientUpdate(Client.storage, update, Clock.GetCurrentSlot(), Utility.ConvertHexStringToRoot("0x4b363db94e286120d76eb905340fdd4e54bfe9f06bf33ff6cf5ad27f511bfe95"));
                        Client.ReadStorage();
                    }

                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"\nError: {ex.Message}");
                }
            }
        }
    }
}
