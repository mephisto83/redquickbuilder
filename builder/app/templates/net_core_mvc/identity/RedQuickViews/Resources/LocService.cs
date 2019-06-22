using Microsoft.Extensions.Localization;
using System;
using Microsoft.AspNetCore.Mvc.Localization;
using System.Collections.Generic;
using System.Globalization;
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


    public class StringLocalizerFactory : IStringLocalizerFactory
    {
        public IStringLocalizer Create(Type resourceSource)
        {
            return new StringLocalizer();
        }

        public IStringLocalizer Create(string baseName, string location)
        {
            return new StringLocalizer();
        }
    }
    public class StringLocalizer : IStringLocalizer
    {
        public LocalizedString this[string name] => new LocalizedString(name, name);

        public LocalizedString this[string name, params object[] arguments] => new LocalizedString(name, name);

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)
        {
            return new List<LocalizedString>();
        }

        public IStringLocalizer WithCulture(CultureInfo culture)
        {
            return this;
        }
    }

    public class RedViewLocalizer : IViewLocalizer
    {
        public LocalizedHtmlString this[string name] => new LocalizedHtmlString(name, name);

        public LocalizedHtmlString this[string name, params object[] arguments] => new LocalizedHtmlString(name, name);

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)
        {
            return new List<LocalizedString>();
        }

        public LocalizedString GetString(string name)
        {
            return new LocalizedString(name, name);
        }

        public LocalizedString GetString(string name, params object[] arguments)
        {
            return new LocalizedString(name, name);
        }

        public IHtmlLocalizer WithCulture(CultureInfo culture)
        {
            return new HtmlLocalizer();
        }
    }
    public class RedHtmlLocalizerFactory : IHtmlLocalizerFactory
    {
        public IHtmlLocalizer Create(Type resourceSource)
        {
            return new HtmlLocalizer();
        }

        public IHtmlLocalizer Create(string baseName, string location)
        {
            return new HtmlLocalizer();
        }
    }
    public class HtmlLocalizer : IHtmlLocalizer
    {
        public LocalizedHtmlString this[string name] => new LocalizedHtmlString(name, name);

        public LocalizedHtmlString this[string name, params object[] arguments] => new LocalizedHtmlString(name, name);

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)
        {
            return new List<LocalizedString>();
        }

        public LocalizedString GetString(string name)
        {
            return new LocalizedString(name, name);
        }

        public LocalizedString GetString(string name, params object[] arguments)
        {
            return new LocalizedString(name, name);
        }

        public IHtmlLocalizer WithCulture(CultureInfo culture)
        {
            return this;
        }
    }
}