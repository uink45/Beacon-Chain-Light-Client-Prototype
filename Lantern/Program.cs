using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;



namespace Lantern
{
    public class Program
    {
        private static ConsoleInterface UserInterface = new ConsoleInterface();
        public static async Task Main(string[] args)
        {
            CreateHostBuilder(args).Build().RunAsync();
            while (true)
            {
                UserInterface.DisplayInformation();
                await UserInterface.MainMenu();
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
