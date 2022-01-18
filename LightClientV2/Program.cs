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
        public static Logging Logs;
        public static Server Server;
        public static bool NextSyncCommitteeReady;

        public static void InitializeObjects()
        {
            Console.Clear();
            Client = new LightClientFunctions();
            Utility = new LightClientUtility();
            Clock = new LocalClock();
            Logs = new Logging();
            Server = new Server();
            NextSyncCommitteeReady = false;
        }

        public static async Task Main(string[] args)
        {
            InitializeObjects();
            CheckSyncPeriod();
            await InitializeLightClient();
            await FetchUpdates();
        }

        public static async Task InitializeLightClient()
        {
            while (true)
            {
                string checkpointRoot = await Server.FetchCheckpointRoot();
                if(checkpointRoot != null)
                {
                    LightClientSnapshot snapshot = await Server.FetchFinalizedSnapshot(checkpointRoot);
                    if(snapshot != null)
                    {
                        Client.ValidateCheckpoint(snapshot);
                        Logs.SelectLogsType("Info", 2, null);
                        Logs.PrintSnapshot(snapshot);
                        break;
                    }              
                }                   
            }
        }

        public static async Task FetchUpdates()
        {
            Logs.SelectLogsType("Info", 3, null);
            while (true)
            {
                try
                {
                    await Task.Delay(11900);
                    if (NextSyncCommitteeReady & CheckSyncPeriod())
                    {
                        LightClientUpdate update = await Server.FetchLightClientUpdate(Clock.SyncPeriodAtEpoch().ToString());
                        if (update != null)
                        {
                            Client.ProcessLightClientUpdate(Client.storage, update, Clock.CurrentSlot(), Utility.ConvertHexStringToRoot("0x4b363db94e286120d76eb905340fdd4e54bfe9f06bf33ff6cf5ad27f511bfe95"));
                            Logs.PrintClientLogs(update);
                        }
                    }
                    else
                    {
                        LightClientUpdate update = await Server.FetchHeader();
                        if (update != null)
                        {
                            Client.ProcessLightClientUpdate(Client.storage, update, Clock.CurrentSlot(), Utility.ConvertHexStringToRoot("0x4b363db94e286120d76eb905340fdd4e54bfe9f06bf33ff6cf5ad27f511bfe95"));
                            Logs.PrintClientLogs(update);
                        }
                    }
                }
                catch (Exception e)
                {
                    Logs.SelectLogsType("Error", 0, e.Message);
                }
            }
        }

        public static bool CheckSyncPeriod()
        {
            
            if (Clock.EpochsInPeriod() == 255 & !NextSyncCommitteeReady)
            {
                NextSyncCommitteeReady = true;
                return true;
            }
            else if(Clock.EpochsInPeriod() > 255 & NextSyncCommitteeReady)
            {
                NextSyncCommitteeReady = false;
            }
            return false;
        }
    }
}
