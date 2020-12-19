using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RedQuickCore.Identity;
using RedQuickCore.Automodel;

namespace {{namespace}}.Web.Controllers
{    
    [Route("api/red/autoservice")]
    [ApiController]
    public class AutoServiceController : RedAutoServiceController
    {
       
        [HttpGet("makers")]
        public override Task<IList<AutoMake>> GetAllMakes()
        {
            return base.GetAllMakes();
        }
        [HttpGet("makers/{search}")]
        public override Task<IList<AutoMake>> GetMakes(string search)
        {
            return base.GetMakes(search);
        }
        [HttpGet("models/{year}/{make}")]
        public override Task<IList<AutoModel>> GetModelsForMakeYear(string year, int make)
        {
            return base.GetModelsForMakeYear(year, make);
        }

    }
}