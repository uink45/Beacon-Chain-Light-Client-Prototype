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
        public static SerializeHeaderUpdate SerializeHeaderUpdate;
        public static SerializeSyncCommittee Sync;

        public Server()
        {
            client = new HttpClient();
            SerializeHeaderUpdate = new SerializeHeaderUpdate();
            Sync = new SerializeSyncCommittee();

        }

        public async Task<LightClientSnapshot> FetchFinalizedSnapshot()
        {
            string url = "http://127.0.0.1:9596/eth/v1/beacon/states/finalized/sync_committees";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
            
                Sync.SerializeData(result);
                return Sync.InitializeSnapshot();
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine("\nException Caught!");
                Console.WriteLine("Message :{0} ", e.Message);
            }
            return null;
        }

        public async Task<string> FetchValidators()
        {
            string url = "http://127.0.0.1:9596/eth/v1/lightclient/snapshot/";
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