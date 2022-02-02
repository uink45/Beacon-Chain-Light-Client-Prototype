using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Lantern.Controllers
{
    [ApiController]

    public class LightClientController : ControllerBase
    {
        [HttpGet]
        [Route("eth/lightclient/header")]
        public string GetHeader()
        {
            string file = "Storage" + @"\" + "chain_data.txt";
            if (System.IO.File.Exists(file))
            {
                return System.IO.File.ReadAllText(file);
            }
            return "Error - 404";
        }
    }
}
