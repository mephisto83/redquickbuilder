using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using RedQuick.Data;
using RedQuick.Util;
using RedQuickCore.Interfaces;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using RedQuickCore.Identity;
using RedQuickCore.Interfaces;
using {{namespace}}.Models;

namespace {{namespace}}.Controllers
{
    //[Route("auth")]
    public class TokenController : RedTokenController<{{model}}> 
    {   
        public TokenController(
          UserManager<{{model}}> userManager, IUserStore<{{model}}> userStore) :
            base(userManager, userStore)
        {
        }

        public async Task<IActionResult> Index()
        {
            var res = await GenerateToken();

            return res;
        }

        public override IList<Claim> GetUserClaims(User user)
        {
            return new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim("Customer", user.Customer ?? string.Empty),
                new Claim(ClaimTypes.NameIdentifier, user.Id ?? string.Empty)
            };
        }
    }
}
