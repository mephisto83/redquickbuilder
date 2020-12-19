using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RedQuickCore.Identity;
using RedQuickCore.Service.StateService;
using RedQuickCore.StateService;

namespace {{namespace}}.Web.Controllers
{    
    [Route("api/red/states")]
    [ApiController]
    public class StateServiceController : RedStateServiceController
    {
       
        [HttpGet("get")]
        public virtual Task<IList<StateProvince>> GetStates()
        {
            return base.GetStates();
        }

    }
}