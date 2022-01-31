using System.Threading.Tasks;

namespace LightClientV2
{
    public class Program 
    {    
        private static ConsoleInterface UserInterface;

        public static async Task Main(string[] args)
        {
            UserInterface = new ConsoleInterface();
            UserInterface.InitializeClasses();
            while (true)
            {
                UserInterface.DisplayInformation();
                await UserInterface.MainMenu();
            }          
        }       
    }
}
