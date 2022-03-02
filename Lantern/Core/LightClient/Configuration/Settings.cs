
namespace Lantern
{
    /// <summary>
    /// Relevant configurable settings for the light client.
    /// </summary>
    public class Settings
    {
        private string serverUrl;
        private string lightClientApiUrl;
        private int network;
        
        public Settings(string server)
        {
            serverUrl = server;
            lightClientApiUrl = "http://localhost:5001";
            network = 0;
        }

        public string ServerUrl { get { return serverUrl; } set { serverUrl = value; } }
        public string LightClientApiUrl { get { return lightClientApiUrl; } set { lightClientApiUrl = value; } }
        public int Network { get { return network; } set { network = value; } }
    }
}
