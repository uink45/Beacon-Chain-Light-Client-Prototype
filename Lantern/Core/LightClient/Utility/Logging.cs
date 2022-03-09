using System;

namespace Lantern
{
    public class Logging
    {
        public Clock Clock;

        public Logging()
        {
            Clock = new Clock();
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
                case "Warn":
                    PrintWarnLogs(log, message);
                    break;
            }    
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
                    Console.WriteLine("Fetching latest checkpoint root at endpoint: " + message);
                    break;
                case 1:
                    Console.WriteLine("Initialising from latest checkpoint root: " + message);
                    break;
                case 2:
                    Console.WriteLine("Initialisation successful!" + " Local Clock - slot: " + Clock.CalculateSlot(0) + ", epoch: " + Clock.CalculateEpoch(0));
                    break;
                case 3:
                    Console.WriteLine("Started tracking the header." + " Local Clock - slot: " + Clock.CalculateSlot(0) + ", epoch: " + Clock.CalculateEpoch(0));
                    break;
                case 4:
                    Console.WriteLine("Running light client server at: " + message);
                    break;
                case 5:
                    Console.WriteLine("Fetching proofs from server: " + message);
                    break;
                case 6:
                    Console.WriteLine("Fetching light client update for sync period: " + message);
                    break;
            }
        }

        public void PrintSnapshot(LightClientSnapshot snapshot)
        {
            Console.Write("[{0}]", DateTime.Now.ToString("MMM-dd HH:mm:ss"));
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.Write(" [LIGHTCLIENT] ");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("Snapshot - slot: " + snapshot.FinalizedHeader.Slot + ", state root: " + snapshot.FinalizedHeader.StateRoot.ToString().Remove(10, 56) + "..." + " Local Clock - slot: " + Clock.CalculateSlot(0) + ", epoch: " + Clock.CalculateEpoch(0));
        }

        public void PrintClientLogs(LightClientUpdate update)
        {
            Console.Write("[{0}]", DateTime.Now.ToString("MMM-dd HH:mm:ss"));
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.Write(" [LIGHTCLIENT] ");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("Header Updated - slot: " + update.AttestedHeader.Slot + ", state root: " + update.AttestedHeader.StateRoot.ToString().Remove(10, 56) + "..." + " Local Clock - slot: " + Clock.CalculateSlot(0) + ", epoch: " + Clock.CalculateEpoch(0));
        }

        private void PrintWarnLogs(int log, string? message)
        {
            Console.Write("[{0}]", DateTime.Now.ToString("MMM-dd HH:mm:ss"));
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.Write(" [WARNING] ");
            Console.ForegroundColor = ConsoleColor.White;
            switch (log)
            {
                case 0:
                    Console.WriteLine(message);
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
                    Console.WriteLine("Update skips a sync committee period." + " Update Period: " + message);
                    break;
                case 1:
                    Console.WriteLine("Invalid finality header merkle branch at slot: " + message);
                    break;
                case 2:
                    Console.WriteLine("Invalid next sync committee merkle branch at slot: " + message);
                    break;
                case 3:
                    Console.WriteLine("Sync committee does not have enough participants. Actual number of participants: " + message);
                    break;
                case 4:
                    Console.WriteLine("Failed verification of sync committee signature at slot: " + message);
                    break;
                case 5:
                    Console.WriteLine("Invalid current sync committee merkle branch at slot: " + message);
                    break;
            }
        }
    }
}
