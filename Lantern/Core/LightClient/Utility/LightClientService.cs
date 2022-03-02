using System.Threading.Tasks;
using System;
using System.Linq;
namespace Lantern
{
    public class LightClientService
    {
        public CoreSpec Client;
        private Settings Settings;
        public string Status;
        public Server Server;
        private Logging Logs;
        private Clock Clock;
        private bool NextSyncCommitteeReady;
        private bool Running;

        public void InitialiseObjects(string server)
        {
            Client = new CoreSpec();
            Settings = new Settings(server);
            Clock = new Clock();
            Status = "Started";
            Logs = new Logging();
            Server = new Server();
            NextSyncCommitteeReady = false;
            Running = true;
        }
        public async Task Launch(string server)
        {
            InitialiseObjects(server);
            CheckSyncPeriod();
            await InitializeLightClient();
        }

        public async Task InitializeLightClient()
        {
            Logs.SelectLogsType("Info", 4, Settings.LightClientApiUrl);
            Status = "Syncing";
            while (Running)
            {
                string checkpointRoot = await Server.FetchCheckpointRoot(Settings.ServerUrl);
                if (checkpointRoot != null)
                {
                    LightClientSnapshot snapshot = await Server.FetchFinalizedSnapshot(Settings.ServerUrl, checkpointRoot);
                    if (snapshot != null)
                    {
                        Client.ValidateCheckpoint(snapshot);
                        Logs.SelectLogsType("Info", 2, null);
                        Logs.PrintSnapshot(snapshot);
                        Logs.SelectLogsType("Info", 3, null);
                        Status = "Synced";
                        break;
                    }
                }
            }
            
        }

        public async Task FetchUpdates()
        {
            int slot = (int)Clock.CalculateSlot(Settings.Network) - 2;
            LightClientUpdate update = await Server.FetchHeader(Settings.ServerUrl, Settings.Network, slot.ToString());
            if (update != null)
            {
                Client.ProcessLightClientUpdate(Client.storage, update, Clock.CalculateSlot(Settings.Network), new Networks().GenesisRoots[Settings.Network]);
                Logs.PrintClientLogs(update);
            }                  
        }


        public bool CheckSyncPeriod()
        {
            if (Clock.CalculateEpochsInSyncPeriod(0) == 255 & !NextSyncCommitteeReady)
            {
                NextSyncCommitteeReady = true;
                return true;
            }
            else if (Clock.CalculateEpochsInSyncPeriod(0) > 255 & NextSyncCommitteeReady)
            {
                NextSyncCommitteeReady = false;
            }
            return false;
        }

    }
}
