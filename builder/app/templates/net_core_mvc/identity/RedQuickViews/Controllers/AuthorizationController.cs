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
using RedQuick.Util;
using {{namespace}}.Controllers;

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

        User _controllerUser;
        public User controllerUser
        {
            get
            {
                if (_controllerUser == null)
                {
                    var claimService = RedStrapper.Resolve<ICreateUser>();
                    var claims = ((System.Security.Claims.ClaimsIdentity)(User.Identity)).Claims;
                    _controllerUser = claimService.Create(claims);
                }
                return _controllerUser;
            }

            set
            {
                _controllerUser = value;
            }
        }
        
        [Route("is/logged/in")]
        [HttpPost]
        public async Task<AuthenticationResult> IsLoggedIn()
        {
            return AuthenticationResult.UserStatus(controllerUser);
        }

        [AllowAnonymous]
        [Route("check/user/login/status")]
        [HttpPost]
        public async Task<AuthenticationResult> CheckUserLoginStatus(RedRegisterViewModel model, string returnUrl = null)
        {
            return AuthenticationResult.UserStatus(controllerUser);
        }

        [AllowAnonymous]
        [Route("register/user")]
        [HttpPost]
        public override Task<bool> Register(RedRegisterViewModel model, string returnUrl = null)
        {
            return base.Register(model, returnUrl);
        }

        [AllowAnonymous]
        [Route("authenticate")]
        [HttpPost]
        public override async Task<string> Authenticate([FromBody] RedLoginModel obj, string returnUrl = null)
        {
            return await base.Authenticate(obj);
        }

        [AllowAnonymous]
        [Route("authenticate/user")]
        [HttpPost]
        public override async Task<AuthenticationResult> AuthenticateUser([FromBody] RedLoginModel obj, string returnUrl = null)
        {
            return await base.AuthenticateUser(obj);
        }

        [HttpGet]
        [Route("get/window/settings/{type}")]
        public override Task<IDictionary<string, object>> GetWindowSettings(string type = "")
        {
            return base.GetWindowSettings();
        }
        
        [AllowAnonymous]
        [Route("anonymous/register/and/authenticate")]
        [HttpPost]
        public override async Task<AuthenticationResult> AnonymousRegisterAndAuthenticate(string returnUrl)
        {
            return await base.AnonymousRegisterAndAuthenticate(returnUrl);
        }

        [AllowAnonymous]
        [Route("registerandauthenticate")]
        [HttpPost]
        public override async Task<AuthenticationResult> RegisterAndAuthenticate([FromBody] RedRegisterViewModel model, string returnUrl = null)
        {
            return await base.RegisterAndAuthenticate(model, returnUrl);
        }

        [AllowAnonymous]
        [Route("forgot/login")]
        [HttpPost]
        public override async Task<AuthenticationResult> ForgotPassword(RedForgotPasswordViewModel model)
        {
            return await base.ForgotPassword(model);
        }

        [Route("change/user/password")]
        [HttpPost]
        public override async Task<AuthenticationResult> ChangePassword(ChangePasswordViewModel model)
        {
            return await base.ChangePassword(model);
        }
    }
}
