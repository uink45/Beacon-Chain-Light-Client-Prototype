using System;
using Spectre.Console;

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
                    Console.WriteLine("Fetching latest checkpoint root from: " + message);
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
                    Console.WriteLine(message);
                    break;
            }
        }
    }
}
