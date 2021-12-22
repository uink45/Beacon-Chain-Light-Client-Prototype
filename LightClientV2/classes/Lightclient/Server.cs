using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Http;
using System.IO;
using Nethermind.Core2.Crypto;
using Newtonsoft.Json.Linq;

namespace LightClientV2
{
    public class Server
    {
        private HttpClient client;
        private string api;
        public static SerializeHeaderUpdate SerializeHeaderUpdate;

        public Server()
        {
            client = new HttpClient();
            SerializeHeaderUpdate = new SerializeHeaderUpdate();
            api = "";
        }

        public Server(string _api)
        {
            client = new HttpClient();
            SerializeHeaderUpdate = new SerializeHeaderUpdate();
            api = _api;
        }

        public string Api { get { return api; } set { api = value; } }

        public async Task<string> InitializeFromCheckpoint()
        {
            string root = FetchLatestFinalizedChekpoint();
            return await FetchSnapshot(root);
        }

        public string FetchLatestFinalizedChekpoint()
        {
            string url = "https://eth2-beacon-mainnet.infura.io/eth/v1/beacon/states/head/finality_checkpoints";
            HttpMessageHandler handler = new HttpClientHandler()
            {
            };

            var httpClient = new HttpClient(handler)
            {
                BaseAddress = new Uri(url),
                Timeout = new TimeSpan(0, 2, 0)
            };

            httpClient.DefaultRequestHeaders.Add("ContentType", "application/json");

            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes("21qajKWbOdMuXWCCPEbxW1bVPrp:5e43bc9d09711d4f34b55077cdb3380a");
            string val = System.Convert.ToBase64String(plainTextBytes);
            httpClient.DefaultRequestHeaders.Add("Authorization", "Basic " + val);

            HttpResponseMessage response = httpClient.GetAsync(url).Result;
            string content = string.Empty;
            using (StreamReader stream = new StreamReader(response.Content.ReadAsStreamAsync().Result, System.Text.Encoding.GetEncoding(0)))
            {
                content = stream.ReadToEnd();
            } 
            return JObject.Parse(content)["data"]["finalized"]["root"].ToString();
        }

        public async Task<string> FetchSnapshot(string root)
        {
            string url = "https://mainnet.lodestar.casa/eth/v1/lightclient/snapshot/" + root;
            // Call asynchronous network methods in a try/catch block to handle exceptions.
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();
                // Above three lines can be replaced with new helper method below
                // string responseBody = await client.GetStringAsync(uri);

                return responseBody;
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine("\nException Caught!");
                Console.WriteLine("Message :{0} ", e.Message);
            }
            return null;
        }

        

        public static LightClientUpdate SerializeContent(List<string> contents)
        {
            try
            {
                if (contents != null)
                {
                    if (contents[0] != null)
                    {
                        LightClientUpdate update = new LightClientUpdate();
                        string syncBits = JObject.Parse(contents[0])["data"]["message"]["body"]["sync_aggregate"]["sync_committee_bits"].ToString();
                        string signature = JObject.Parse(contents[0])["data"]["message"]["body"]["sync_aggregate"]["sync_committee_signature"].ToString();
                        update.SyncAggregate = SerializeHeaderUpdate.CreateSyncAggregate(syncBits, signature);

                        string slot = JObject.Parse(contents[0])["data"]["message"]["slot"].ToString();
                        string index = JObject.Parse(contents[0])["data"]["message"]["proposer_index"].ToString();
                        string parentRoot = JObject.Parse(contents[0])["data"]["message"]["parent_root"].ToString();
                        string stateRoot = JObject.Parse(contents[0])["data"]["message"]["state_root"].ToString();
                        update.AttestedHeader = SerializeHeaderUpdate.CreateBeaconBlockHeader(slot, index, parentRoot, stateRoot, stateRoot);
                        update.ForkVersion = SerializeHeaderUpdate.Utility.ConvertStringToForkVersion("0x01000000");
                        return update;
                    }
                }
            }
            catch
            {
                throw new Exception("\nError retrieving information from the requested API.");
            }
            
            return null;
        }
    }   
}