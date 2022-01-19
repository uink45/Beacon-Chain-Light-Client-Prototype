using System;
using System.Threading.Tasks;
using System.Net.Http;
using Newtonsoft.Json.Linq;

namespace LightClientV2
{
    public class Server
    {
        private HttpClient client;
        private SerializeLightClientUpdate headerUpdate;
        private SerializeSnapshot syncSnapshot;
        private SerializeHeader header;
        private Logging logs;

        public Server()
        {
            client = new HttpClient();
            headerUpdate = new SerializeLightClientUpdate();
            syncSnapshot = new SerializeSnapshot();
            header = new SerializeHeader();
            logs = new Logging();
        }


        public async Task<string> FetchCheckpointRoot()
        {
            string url = "http://127.0.0.1:9596/eth/v1/beacon/states/head/finality_checkpoints";
            logs.SelectLogsType("Info", 0, url.Remove(22, 46));
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                return JObject.Parse(result)["data"]["finalized"]["root"].ToString();
            }
            catch (Exception e)
            {
                logs.SelectLogsType("Error", 0, e.Message);
                await Task.Delay(15000);
            }
            return null;
        }
 
        public async Task<LightClientSnapshot> FetchFinalizedSnapshot(string checkpointRoot)
        {
            string url = "http://127.0.0.1:9596/eth/v1/lightclient/snapshot/" + checkpointRoot;
            logs.SelectLogsType("Info", 1, checkpointRoot);
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                syncSnapshot.SerializeData(result);
                return syncSnapshot.InitializeSnapshot();
            }
            catch (Exception e)
            {
                logs.SelectLogsType("Error", 0, e.Message);
                await Task.Delay(15000);
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

                header.SerializeData(result);
                return header.InitializeHeader();
            }
            catch (HttpRequestException e)
            {
                logs.SelectLogsType("Error", 0, e.Message);
                await Task.Delay(5000);
            }
            return null;
        }

        public async Task<LightClientUpdate> FetchLightClientUpdate(string syncPeriod)
        {
            string url = "http://127.0.0.1:9596/eth/v1/lightclient/committee_updates?from=" + syncPeriod + "&to=" + syncPeriod;
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();

                headerUpdate.SerializeData(result);
                return headerUpdate.InitializeLightClientUpdate();
            }
            catch (HttpRequestException e)
            {
                logs.SelectLogsType("Error", 0, e.Message);
                await Task.Delay(5000);
            }
            return null;
        }
    }   
}