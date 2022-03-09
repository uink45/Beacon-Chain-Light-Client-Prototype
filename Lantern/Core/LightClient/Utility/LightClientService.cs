using System.Threading.Tasks;
using System;
namespace Lantern
{
    public class LightClientService
    {
        public CoreSpec Client;
        private Settings Settings;
        public ulong NextSyncCommitteePeriod;
        public string Status;
        public Server Server;
        private Logging Logs;
        private Clock Clock;

        public void InitialiseObjects(string server)
        {
            Settings = new Settings(server);
            Client = new CoreSpec(); 
            Clock = new Clock();
            Status = "Started";
            Logs = new Logging();
            Server = new Server();
            NextSyncCommitteePeriod = Clock.CalculateSyncPeriod(Settings.Network) + 1;
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
            Logs.SelectLogsType("Info", 4, Settings.LightClientApiUrl);
            Status = "Syncing";
            while (true)
            {
                string checkpointRoot = await Server.FetchCheckpointRoot(Settings.ServerUrl);
                if (checkpointRoot != null)
                {
                    LightClientSnapshot snapshot = await Server.FetchFinalizedSnapshot(Settings.ServerUrl, checkpointRoot);
                    if (snapshot != null && Client.ValidateCheckpoint(snapshot))
                    {                       
                        Logs.SelectLogsType("Info", 2, null);
                        Logs.PrintSnapshot(snapshot);
                        Logs.SelectLogsType("Info", 3, null);                       
                        break;
                    }
                    await Task.Delay(3000);
                }
            }
            
        }

        public async Task FetchNextSyncCommitteeUpdate()
        {
            Logs.SelectLogsType("Info", 6, Clock.CalculateSyncPeriod(Settings.Network).ToString());
            LightClientUpdate update = await Server.FetchLightClientUpdate(Settings.ServerUrl, Clock.CalculateSyncPeriod(Settings.Network).ToString());
            while (true)
            {
                if (update != null && Client.ProcessLightClientUpdate(Client.storage, update, Clock.CalculateSlot(Settings.Network), new Networks().GenesisRoots[Settings.Network]))
                {
                    Logs.PrintClientLogs(update);
                    break;
                }
                await Task.Delay(3000);
            }            
        }

        public async Task FetchHeaderUpdate()
        {            
            LightClientUpdate update;
            try
            {
                if (CheckSyncPeriod())
                {
                    Logs.SelectLogsType("Info", 6, Clock.CalculateSyncPeriod(Settings.Network).ToString());
                    update = await Server.FetchLightClientUpdate(Settings.ServerUrl, Clock.CalculateSyncPeriod(Settings.Network).ToString());
                }
                else
                {
                    if (IsLatestOptimisticHeader())
                    {
                        int slotToRequest = (int)Client.storage.OptimisticHeader.Slot + 1;
                        update = await Server.FetchHeaderAtSlot(Settings.ServerUrl, Settings.Network, slotToRequest.ToString());
                    }
                    else
                    {
                        update = await Server.FetchHeader(Settings.ServerUrl, Settings.Network);
                    }
                }
                if (update != null && Client.ProcessLightClientUpdate(Client.storage, update, Clock.CalculateSlot(Settings.Network), new Networks().GenesisRoots[Settings.Network]))
                {
                    Status = "Synced";
                    Logs.PrintClientLogs(update);
                }
            }
            catch (Exception e)
            {
            }                       
        }


        public bool CheckSyncPeriod()
        {
            if(Clock.CalculateSyncPeriod(Settings.Network) == NextSyncCommitteePeriod)
            {
                NextSyncCommitteePeriod = NextSyncCommitteePeriod + 1;
                return true;
            }
            return false;
        }


        public bool IsLatestOptimisticHeader()
        {
            int slot = (int)Clock.CalculateSlot(Settings.Network);
            int expectedSlot = (int)Client.storage.OptimisticHeader.Slot + 1;

            if(slot != expectedSlot)
            {
                return false;
            }
            return true;
        }
    }
}
