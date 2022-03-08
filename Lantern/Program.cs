using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using System.Diagnostics;
using System;
namespace Lantern
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //var process = new Process();
            //process.StartInfo.FileName = "cmd.exe";
            //process.StartInfo.WorkingDirectory = System.IO.Directory.GetCurrentDirectory() + @"\BeaconNode";
            //process.StartInfo.Arguments = "/c node packages/cli/bin/lodestar beacon --eth1.enabled false --network mainnet --weakSubjectivityServerUrl https://21qajKWbOdMuXWCCPEbxW1bVPrp:5e43bc9d09711d4f34b55077cdb3380a@eth2-beacon-mainnet.infura.io --weakSubjectivitySyncLatest true";
            //process.Start();
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });

        //  Console.WriteLine(IsValidProof(proof[2], branches, 44, 24189255811072, hashTreeRoot));

    }
}
