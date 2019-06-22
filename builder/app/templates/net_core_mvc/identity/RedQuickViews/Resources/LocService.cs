using Microsoft.Extensions.Localization;
using System.Reflection;

namespace {{namespace}}.Resources
{
    
    public class LocService
    {
        private readonly IStringLocalizer _localizer;
 
        public LocService(IStringLocalizerFactory factory)
        {
            var type = typeof(SharedResource);
            var assemblyName = new AssemblyName(type.GetTypeInfo().Assembly.FullName);
            _localizer = factory.Create("SharedResource", assemblyName.Name);
        }
 
        public LocalizedString GetLocalizedHtmlString(string key)
        {
            return _localizer[key];
        }
    }
    
    /// <summary>
    /// class to group shared resources
    /// </summary>
    public class SharedResource
    {
    }
}