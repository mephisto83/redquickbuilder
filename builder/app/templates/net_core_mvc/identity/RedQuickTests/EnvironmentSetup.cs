using RedQuick.Storage;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace {{namespace}}.Tests
{
    [TestClass]
    public class EnvironmentSetups
    {

        [TestMethod]
        public async Task SetupEnvironment()
        {
            await RedStorage.InitCollections(RedStorage.DatabaseId);
        }

    }
}
