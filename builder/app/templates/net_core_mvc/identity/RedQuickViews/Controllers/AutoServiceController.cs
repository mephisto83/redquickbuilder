using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RedQuickCore.Identity;
using RedQuickCore.Automodel;
using RedQuick.Data;

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
        [HttpGet("make/{make}")]
        public override Task<AutoMake> GetAutoMake(int make)
        {
            return base.GetAutoMake(make);
        }
        [HttpGet("model/{make}/{model}/{year}")]
        public override Task<AutoModel> GetAutoModel(int make, int model, string year)
        {
            return base.GetAutoModel(make, model, year);
        }
        
        [HttpGet("get/vin/{vin}")]
        public override Task<IList<VehicleIdentificationNumber>> GetVin(string vin, string year = "")
        {
            return base.GetVin(vin, year);
        }
    }
}