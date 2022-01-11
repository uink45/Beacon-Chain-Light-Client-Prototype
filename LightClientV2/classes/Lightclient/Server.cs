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
        public SerializeHeaderUpdate HeaderUpdate;
        public SerializeSnapshot SyncSnapshot;
        public SerializeHeader Header;

        public Server()
        {
            client = new HttpClient();
            HeaderUpdate = new SerializeHeaderUpdate();
            SyncSnapshot = new SerializeSnapshot();
            Header = new SerializeHeader();
        }

        public async Task<string> FetchCheckpointRoot()
        {
            string url = "http://127.0.0.1:9596/eth/v1/beacon/states/head/finality_checkpoints";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                return JObject.Parse(result)["data"]["finalized"]["root"].ToString();
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine("\nException Caught!");
                Console.WriteLine("Message: {0} ", e.Message);
            }
            return null;
        }
 
        public async Task<LightClientSnapshot> FetchFinalizedSnapshot()
        {
            string url = "http://127.0.0.1:9596/eth/v1/lightclient/snapshot/" + await FetchCheckpointRoot();
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();

                SyncSnapshot.SerializeData(result);
                return SyncSnapshot.InitializeSnapshot();
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine("\nException Caught!");
                Console.WriteLine("Message :{0} ", e.Message);
            }
            return null;
        }

        public async Task<LightClientUpdate> FetchHeader()
        {
            string url = "http://127.0.0.1:9596/eth/v1/lightclient/head_update/";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();

                Header.SerializeData(result);
                return Header.InitializeHeader();
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine("\nException Caught!");
                Console.WriteLine("Message :{0} ", e.Message);
            }
            return null;
        }

        public async Task<LightClientUpdate> FetchLightClientUpdate()
        {
            string url = "http://127.0.0.1:9596/eth/v1/lightclient/head/header_update";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();

                HeaderUpdate.SerializeData(result);
                return HeaderUpdate.InitializeHeaderUpdate();
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine("\nException Caught!");
                Console.WriteLine("Message :{0} ", e.Message);
            }
            return null;
        }
    }   
}