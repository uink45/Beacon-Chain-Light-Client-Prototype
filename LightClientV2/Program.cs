using System;
using System.Net.Http;
using System.IO;
using System.Linq;
using Nethermind.Core2.Containers;
using Nethermind.Core2.Types;
using System.Collections.Generic;
using System.Windows.Forms;
using System.Threading.Tasks;
using Nethermind.Core2.Crypto;

namespace LightClientV2
{
    public class Program 
    {   
        public static LightClientFunctions Client;
        public static LightClientUtility Utility;
        public static LocalClock Clock;
        public static Server Server; 

        public static void InitializeObjects()
        {
            Client = new LightClientFunctions();
            Utility = new LightClientUtility();
            Clock = new LocalClock();
            Server = new Server();
        }

        public static async Task Main(string[] args)
        {
            InitializeObjects();
            await InitializeLightClient();
            await FetchUpdates();
        }

        public static async Task InitializeLightClient()
        {
            Console.Clear();
            Console.WriteLine("Initiailizing From Finality Checkpoint Root...");
            LightClientSnapshot snapshot = await Server.FetchFinalizedSnapshot();
            Client.ValidateCheckpoint(snapshot);
            Console.WriteLine("\nSuccessfully Initialized!");
            Console.WriteLine("\nCheckpoint Header");
            Console.WriteLine("======================");
            Console.WriteLine("Slot - " + Client.storage.FinalizedHeader.Slot.ToString());
            Console.WriteLine("Validator Index - " + Client.storage.FinalizedHeader.ValidatorIndex.ToString());
            Console.WriteLine("Block Root - " + Client.storage.FinalizedHeader.HashTreeRoot().ToString());
            Console.WriteLine("Parent Root - " + Client.storage.FinalizedHeader.ParentRoot.ToString());
            Console.WriteLine("State Root - " + Client.storage.FinalizedHeader.StateRoot.ToString());
            Console.WriteLine("Body Root - " + Client.storage.FinalizedHeader.BodyRoot.ToString());
        }

        public static async Task FetchUpdates()
        {
            Console.WriteLine("\nStarted Tracking Header...");
            HttpClient client = new HttpClient();
            client.Timeout = TimeSpan.FromSeconds(180);
            string url = $"http://127.0.0.1:9596/eth/v2/beacon/blocks/head";
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
                Console.ForegroundColor = ConsoleColor.White;
            }
        }
    }
}
