using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using RedQuickCore.Identity;
using RedQuickCore.Interfaces;
using RedQuickCore.Data;
using {{namespace}}.Models;

namespace {{namespace}}.Web.Controllers
{
    [Route("api/authorization")]
    [ApiController]
    public class AuthorizationController : RedAuthorizationService<User>
    {

        public AuthorizationController(
            UserManager<User> _userManager,
            SignInManager<User> _signInManager,
            ILogger<RedAuthorizationController<User>> _logger,
            IRedEmailSender _emailSender) :
            base(_userManager, _signInManager, _logger, _emailSender)
        {
        }

        public override User CreateUser(RedExternalLoginViewModel model)
        {
            return {{namespace}}.Models.User.Create(model);
        }

        public override User CreateUser(RedRegisterViewModel model)
        {
            return {{namespace}}.Models.User.Create(model);
        }

        [AllowAnonymous]
        [Route("register")]
        [HttpPost]
        public override Task<bool> Register(RedRegisterViewModel model, string returnUrl = null)
        {
            return base.Register(model, returnUrl);
        }

        [AllowAnonymous]
        [Route("authenticate")]
        [HttpPost]
        public override async Task<AuthenticationResult> Authenticate([FromBody] RedLoginModel obj, string returnUrl = null)
        {
            return await base.Authenticate(obj);
        }

        [AllowAnonymous]
        [Route("authenticateuser")]
        [HttpPost]
        public override async Task<AuthenticationResult> AuthenticateUser([FromBody] RedLoginModel obj, string returnUrl = null)
        {
            return await base.AuthenticateUser(obj);
        }

        [AllowAnonymous]
        [Route("authenticateanonym")]
        [HttpPost]
        public virtual async Task<AuthenticationResult> AnonymousRegisterAndAuthenticate(string returnUrl)
        {
            return await base.AnonymousRegisterAndAuthenticate(returnUrl);
        }

        [AllowAnonymous]
        [Route("registerandauthenticate")]
        [HttpPost]
        public override Task<string> RegisterAndAuthenticate([FromBody] RedRegisterViewModel model, string returnUrl = null)
        {
            return base.RegisterAndAuthenticate(model, returnUrl);
        }
    }
}
