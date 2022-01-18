using System;
using Nethermind.Core2.Types;
using Nethermind.Core2.Containers;


namespace LightClientV2
{
    public class Logging
    {
        public LocalClock Clock;

        public Logging()
        {
            Clock = new LocalClock();
        }
        public void SelectLogsType(string category, int log, string? message)
        {
            switch (category)
            {
                case "Info":
                    PrintInfoLogs(log, message);
                    break;
                case "Error":
                    PrintErrorLogs(log, message);
                    break;
            }    
        }

        public void PrintSnapshot(LightClientSnapshot snapshot)
        {
            Console.Write("[{0}]", DateTime.Now.ToString("MMM-dd HH:mm:ss"));
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.Write(" [LIGHTCLIENT] ");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("Snapshot - slot: " + snapshot.FinalizedHeader.Slot + ", state root: " + snapshot.FinalizedHeader.StateRoot.ToString().Remove(10, 56) + "..." + " Local Clock - slot: " + Clock.CurrentSlot() + ", epoch: " + Clock.CurrentEpoch());
        }

        public void PrintClientLogs(LightClientUpdate update)
        {
            Console.Write("[{0}]", DateTime.Now.ToString("MMM-dd HH:mm:ss"));
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.Write(" [LIGHTCLIENT] ");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("Header Updated - slot: " + update.AttestedHeader.Slot + ", state root: " + update.AttestedHeader.StateRoot.ToString().Remove(10, 56) + "..." + " Local Clock - slot: " + Clock.CurrentSlot() + ", epoch: " + Clock.CurrentEpoch());
        }

        private void PrintInfoLogs(int log, string? message)
        {
            Console.Write("[{0}]", DateTime.Now.ToString("MMM-dd HH:mm:ss"));
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.Write(" [INFO] ");
            Console.ForegroundColor = ConsoleColor.White;
            switch (log)
            {
                case 0:                             
                    Console.WriteLine("Fetching latest checkpoint root from: " + message);
                    break;
                case 1:
                    Console.WriteLine("Initializing from latest checkpoint root: " + message);
                    break;
                case 2:
                    Console.WriteLine("Initialization successful!" + " Local Clock - slot: " + Clock.CurrentSlot() + ", epoch: " + Clock.CurrentEpoch());
                    break;
                case 3:
                    Console.WriteLine("Started tracking the header." + " Local Clock - slot: " + Clock.CurrentSlot() + ", epoch: " + Clock.CurrentEpoch());
                    break;
            }
        }


        private void PrintErrorLogs(int log, string? message)
        {
            Console.Write("[{0}]", DateTime.Now.ToString("MMM-dd HH:mm:ss"));
            Console.ForegroundColor = ConsoleColor.Red;
            Console.Write(" [ERROR] ");
            Console.ForegroundColor = ConsoleColor.White;
            switch (log)
            {
                case 0:
                    Console.WriteLine(message);
                    break;
            }
        }

    }
}
