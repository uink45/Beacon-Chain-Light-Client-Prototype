using System.Threading.Tasks;
using System;

namespace Lantern
{
    public class LightClientService
    {
        private CoreSpec Client;
        private Settings Settings;
        private Server Server;
        private Logging Logs;
        private Clock Clock;
        private bool NextSyncCommitteeReady;
        private bool Running;

        public void InitialiseObjects()
        {
            Client = new CoreSpec();
            Settings = new Settings();
            Clock = new Clock();
            Logs = new Logging();
            Server = new Server();
            NextSyncCommitteeReady = false;
            Running = true;
        }
        public async Task Launch()
        {
            InitialiseObjects();
            CheckSyncPeriod();
            await InitializeLightClient();
            await FetchUpdates();
        }

        public async Task InitializeLightClient()
        {
            Logs.SelectLogsType("Info", 4, Settings.LightClientApiUrl);
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
                        break;
                    }
                }
            }
        }

        public async Task FetchUpdates()
        {
            Logs.SelectLogsType("Info", 3, null);
            while (Running)
            {
                try
                {
                    
                    if (NextSyncCommitteeReady & CheckSyncPeriod())
                    {
                        LightClientUpdate update = await Server.FetchLightClientUpdate(Settings.ServerUrl, Clock.CalculateRemainingSyncPeriod(Settings.Network).ToString());
                        if (update != null)
                        {
                            Client.ProcessLightClientUpdate(Client.storage, update, Clock.CalculateSlot(Settings.Network), new Networks().GenesisRoots[Settings.Network]);
                            Logs.PrintClientLogs(update);
                        }
                    }
                    else
                    {
                        LightClientUpdate update = await Server.FetchHeader(Settings.ServerUrl, Settings.Network);
                        if (update != null)
                        {
                            Client.ProcessLightClientUpdate(Client.storage, update, Clock.CalculateSlot(Settings.Network), new Networks().GenesisRoots[Settings.Network]);
                            Logs.PrintClientLogs(update);
                        }
                    }
                    await Task.Delay(12000);
                }
                catch (Exception e)
                {
                    await Task.Delay(5000);
                }
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
