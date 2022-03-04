using System;
using System.Threading.Tasks;
using System.Net.Http;
using Newtonsoft.Json.Linq;

namespace Lantern
{
    public class Server
    {
        private HttpClient client;
        private SerializeLightClientUpdate headerUpdate;
        private SerializeSnapshot syncSnapshot;
        private SerializeHeader header;
        private SerializeProofs proofs;
        private Logging logs;

        public Server()
        {
            client = new HttpClient();
            headerUpdate = new SerializeLightClientUpdate();
            syncSnapshot = new SerializeSnapshot();
            header = new SerializeHeader();
            proofs = new SerializeProofs();
            logs = new Logging();
        }

        /// <summary>
        /// Fetches the latest checkpoint root from the
        /// REST API server.
        /// </summary>
        public async Task<string> FetchCheckpointRoot(string serverUrl)
        {
            string url = serverUrl + "/eth/v1/beacon/states/head/finality_checkpoints";
            logs.SelectLogsType("Info", 0, url);
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
                await Task.Delay(1000);
            }
            return null;
        }

        /// <summary>
        /// Fetches the light client snapshot object
        /// using the checkpoint root obtained 
        /// from the REST API server.
        /// </summary>
        public async Task<LightClientSnapshot> FetchFinalizedSnapshot(string serverUrl, string checkpointRoot)
        {
            string url = serverUrl + "/eth/v1/lightclient/snapshot/" + checkpointRoot;
            logs.SelectLogsType("Info", 1, checkpointRoot);
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                syncSnapshot.SerializeData(result);
                return syncSnapshot.InitializeSnapshot();
            }
            catch(Exception e)
            {
                logs.SelectLogsType("Error", 0, e.Message);
                await Task.Delay(1000);
            }
            return null;       
        }

        /// <summary>
        /// Fetches the light client header object
        /// from the REST API server.
        /// </summary>
        public async Task<LightClientUpdate> FetchHeaderAtSlot(string serverUrl, int network, string slot)
        {
            string url = serverUrl + "/eth/v1/lightclient/head_update_by_slot/" + slot;
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                header.SerializeData(result);
                return header.InitializeHeader(network);
            }
            catch (Exception e)
            {
                logs.SelectLogsType("Error", 0, e.Message);
                await Task.Delay(1000);
            }
            return null;         
        }

        /// <summary>
        /// Fetches the light client header object
        /// from the REST API server.
        /// </summary>
        public async Task<LightClientUpdate> FetchHeader(string serverUrl, int network)
        {
            string url = serverUrl + "/eth/v1/lightclient/head_update/";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                header.SerializeData(result);
                return header.InitializeHeader(network);
            }
            catch (Exception e)
            {
                logs.SelectLogsType("Error", 0, e.Message);
                await Task.Delay(1000);
            }
            return null;
        }

        /// <summary>
        /// Fetches the light client update object
        /// from the REST API server.
        /// </summary>
        public async Task<LightClientUpdate> FetchLightClientUpdate(string serverUrl, string syncPeriod)
        {
            string url = serverUrl + "/eth/v1/lightclient/committee_updates?from=" + syncPeriod + "&to=" + syncPeriod;
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();

                headerUpdate.SerializeData(result);
                return headerUpdate.InitializeLightClientUpdate();
            }
            catch(Exception e)
            {
                logs.SelectLogsType("Error", 0, e.Message);
                await Task.Delay(1000);
            }
            return null;    
        }

        /// <summary>
        /// Fetches the light client update object
        /// from the REST API server.
        /// </summary>
        public async Task<LightClientProofs> FetchProofs(string serverUrl, string stateRoot, string validatorIndex)
        {
            string url = serverUrl + "/eth/v1/lightclient/proof/" + stateRoot + "?paths=%5B%22balances%22%2C" + validatorIndex + "%5D";
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string result = await response.Content.ReadAsStringAsync();
                proofs.SerializeData(result);
                return proofs.InitializeProofs();
            }
            catch (Exception e)
            {
                logs.SelectLogsType("Error", 0, e.Message);
                await Task.Delay(1000);
            }
            return null;
        }
    }   
}