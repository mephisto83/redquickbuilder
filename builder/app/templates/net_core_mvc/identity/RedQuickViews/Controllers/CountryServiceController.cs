using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RedQuickCore.Identity;
using RedQuickCore.Service.CountryService;

namespace {{namespace}}.Web.Controllers
{    
    [Route("api/red/countries")]
    [ApiController]
    public class CountryServiceController : RedCountryServiceController
    {
       
        [HttpGet("get")]
        public virtual Task<IList<Country>> GetCountries()
        {
            return base.GetCountries();
        }

    }
}