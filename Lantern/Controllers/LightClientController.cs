using Microsoft.AspNetCore.Mvc;
using LiteDB;
using System.Linq;

namespace Lantern.Controllers
{
    [Route("api/[controller]/header")]
    [ApiController]
    public class LightClientController : ControllerBase
    {
        [HttpGet("{slot:int}")]
        public string GetHeader(int slot)
        {
            using(var db = new LiteDatabase(@"chain_data.db"))
            {
                var headers = db.GetCollection<HeaderDB>("headers");
                var header = headers.Find(x => x.slot == slot.ToString());
                string data = System.Text.Json.JsonSerializer.Serialize(header);
                return data;
            }
        }

        [HttpGet]
        [Route("head")]
        public string GetLatestHeader()
        {
            using (var db = new LiteDatabase(@"chain_data.db"))
            {
                var headers = db.GetCollection<HeaderDB>("headers");
                var header = headers.FindById(headers.Count());
                string data = System.Text.Json.JsonSerializer.Serialize(header);
                return data;
            }
        }
    }
}
