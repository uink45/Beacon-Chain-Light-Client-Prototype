using System.Threading.Tasks;
using System;
namespace Lantern
{
    public class LightClientService
    {
        public CoreSpec client = new CoreSpec();
        public Server server = new Server();
        private Settings settings;
        public string status;        

        public void InitialiseObjects(string server)
        {
            settings = new Settings(server);
            client.nextSyncCommitteePeriod = client.clock.CalculateSyncPeriod(settings.Network) + 1;
            status = "Started";
        }

        public async Task Launch(string server)
        {            
            InitialiseObjects(server);
            await InitializeLightClient();
            await FetchNextSyncCommitteeUpdate();
            await FetchHeaderUpdate();
        }
 
        public async Task InitializeLightClient()
        {
            client.logging.SelectLogsType("Info", 4, settings.LightClientApiUrl);
            status = "Syncing";
            while (true)
            {
                string checkpointRoot = await server.FetchCheckpointRoot(settings.ServerUrl);
                if (checkpointRoot != null)
                {
                    LightClientSnapshot snapshot = await server.FetchFinalizedSnapshot(settings.ServerUrl, checkpointRoot);
                    if (snapshot != null && client.ValidateCheckpoint(snapshot))
                    {
                        client.logging.SelectLogsType("Info", 2, null);
                        client.logging.PrintSnapshot(snapshot);
                        client.logging.SelectLogsType("Info", 3, null);                       
                        break;
                    }
                    await Task.Delay(3000);
                }
            }
        }

        public async Task FetchNextSyncCommitteeUpdate()
        {
            client.logging.SelectLogsType("Info", 6, client.logging.Clock.CalculateSyncPeriod(settings.Network).ToString());
            LightClientUpdate update = await server.FetchLightClientUpdate(settings.ServerUrl, client.logging.Clock.CalculateSyncPeriod(settings.Network).ToString());
            while (true)
            {
                if (update != null && client.ProcessLightClientUpdate(client.storage, update, client.logging.Clock.CalculateSlot(settings.Network), new Networks().GenesisRoots[settings.Network]))
                {
                    client.logging.PrintClientLogs(update);
                    break;
                }
                await Task.Delay(3000);
            }            
        }

        public async Task FetchHeaderUpdate()
        {            
            LightClientUpdate update;
            if (CheckSyncPeriod())
            {
                client.logging.SelectLogsType("Info", 6, client.clock.CalculateSyncPeriod(settings.Network).ToString());
                update = await server.FetchLightClientUpdate(settings.ServerUrl, client.clock.CalculateSyncPeriod(settings.Network).ToString());
            }
            else
            {
                if (IsLatestOptimisticHeader())
                {
                    int slotToRequest = (int)client.storage.OptimisticHeader.Slot + 1;
                    update = await server.FetchHeaderAtSlot(settings.ServerUrl, settings.Network, slotToRequest.ToString());
                }
                else
                {
                    update = await server.FetchHeader(settings.ServerUrl, settings.Network);
                }
            }

            if (update != null)
            {
                if (client.ProcessLightClientUpdate(client.storage, update, client.clock.CalculateSlot(settings.Network), new Networks().GenesisRoots[settings.Network]))
                {
                    status = "Synced";
                    client.logging.PrintClientLogs(update);
                }
            }            
        }

        public bool CheckSyncPeriod()
        {
            if(client.clock.CalculateSyncPeriod(settings.Network) == client.nextSyncCommitteePeriod)
            {
                client.nextSyncCommitteePeriod = client.nextSyncCommitteePeriod + 1;
                return true;
            }
            return false;
        }


        public bool IsLatestOptimisticHeader()
        {
            int slot = (int)client.clock.CalculateSlot(settings.Network);
            int expectedSlot = (int)client.storage.OptimisticHeader.Slot + 1;

            if(slot != expectedSlot)
            {
                return false;
            }
            return true;
        }
    }
}
