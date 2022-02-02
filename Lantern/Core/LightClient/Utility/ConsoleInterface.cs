using System.Threading.Tasks;
using Spectre.Console;
using System;

namespace Lantern
{
    public class ConsoleInterface
    {
        private CoreSpec Client;
        private Settings Settings;
        private Server Server;
        private Logging Logs;
        private Clock Clock;
        private bool NextSyncCommitteeReady;
        private bool Running;

        public ConsoleInterface()
        {
            Client = new CoreSpec();
            Settings = new Settings();
            Clock = new Clock();
            Logs = new Logging();
            Server = new Server();
            NextSyncCommitteeReady = false;
            Running = true;
        }

        public void DisplayInformation()
        {
            // Clear Console and display title name
            Console.Clear();
            AnsiConsole.Write(new FigletText("Lantern")
                .Alignment(Justify.Center)
                .Color(Color.Yellow));

            var specVersion = new Rule("[mediumspringgreen]Specification Version - 1.1.7[/]")
                .RuleStyle(Style.Parse("mediumspringgreen"))
                .Alignment(Justify.Center);
            AnsiConsole.Write(specVersion);

            var consensusLayer = new Rule("[mediumspringgreen]Consensus Layer Light Client[/]")
                .RuleStyle(Style.Parse("mediumspringgreen"))
                .Alignment(Justify.Center);
            AnsiConsole.Write(consensusLayer);
        }

        public async Task MainMenu()
        {
            var option = AnsiConsole.Prompt(
                new SelectionPrompt<string>()
                    .Title("\n[mediumspringgreen]SELECT AN OPTION:[/]")
                    .HighlightStyle("11")
                    .MoreChoicesText("[yellow](Move up (▲) and down (▼) to reveal more choices)[/]")
                    .PageSize(3)
                    .AddChoices(new[] {
                        "[mediumspringgreen]Connect (~)[/]", "[mediumspringgreen]Configuration (*)[/]", "[red]Help (?)[/]", "[mediumspringgreen]Close (x)[/]"})); ;
            

            switch (option)
            {
                case "[mediumspringgreen]Connect (~)[/]":
                    await SelectNetwork();
                    return;
                case "[mediumspringgreen]Configuration (*)[/]":
                    SelectConfig();
                    return;
                case "[red]Help (?)[/]":
                    return;
                case "[mediumspringgreen]Close (x)[/]":
                     Console.Clear();
                     Environment.Exit(0);  
                    return;
            }
        }

        public async Task SelectNetwork() {

            DisplayInformation();

            var option = AnsiConsole.Prompt(
               new SelectionPrompt<string>()
                   .Title("\n[mediumspringgreen]SELECT A NETWORK:[/]")
                   .HighlightStyle("11")
                   .PageSize(3)
                   .AddChoices(new[] {"[mediumspringgreen]Beacon Chain[/]", "[mediumspringgreen]Pyrmont[/]", "[mediumspringgreen]Go Back (<-)[/]"}));

            switch (option)
            {
                case "[mediumspringgreen]Beacon Chain[/]":
                    Settings.Network = 0;
                    await InitialiseSyncing(Settings);
                    return;
                case "[mediumspringgreen]Pyrmont[/]":
                    Settings.Network = 1;
                    await InitialiseSyncing(Settings);
                    return;
                case "[mediumspringgreen]Go Back (<-)[/]":
                    return;
            }
        }

        public void SelectConfig()
        {
            DisplayInformation();

            var option = AnsiConsole.Prompt(
               new SelectionPrompt<string>()
                   .Title("\n[mediumspringgreen]SELECT A SETTING TO CHANGE:[/]")
                   .HighlightStyle("11")
                   .PageSize(3)
                   .AddChoices(new[] { $"[mediumspringgreen]Network Server URL:[/] [Lime]{Settings.ServerUrl}[/]", "[mediumspringgreen]Go Back (<-)[/]" }));

            if(option == $"[mediumspringgreen]Network Server URL:[/] [Lime]{Settings.ServerUrl}[/]")
            {
                Settings.ServerUrl = AnsiConsole.Ask<string>("[mediumspringgreen]Enter the network's server URL:[/]");
            }
            else if(option == "[mediumspringgreen]Go Back (<-)[/]")
            {
                return;
            }
            SelectConfig();
        }

        public async Task InitialiseSyncing(Settings settings)
        {
            Console.Clear();
            var message = new Rule("[mediumspringgreen]Press[/] [yellow]CTRL[/] [mediumspringgreen]+[/] [yellow]C[/][mediumspringgreen] To Return (Will need to wait)[/]")
                .RuleStyle(Style.Parse("mediumspringgreen"))
                .Alignment(Justify.Center);
            AnsiConsole.Write(message);
            Console.WriteLine();
            await Connect();
        }

        public async Task Connect()
        {
            DetectKeyPress();
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

        public async Task DetectKeyPress()
        {
            Console.CancelKeyPress += (object sender, ConsoleCancelEventArgs e) =>
            {
                var isCtrlC = e.SpecialKey == ConsoleSpecialKey.ControlC;

                // Prevent CTRL-C from terminating
                if (isCtrlC)
                {
                    Running = false;
                    e.Cancel = true;
                }
            };
        }

        public async Task FetchUpdates()
        {
            Logs.SelectLogsType("Info", 3, null);
            while (Running)
            {
                await Task.Delay(12000);
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
