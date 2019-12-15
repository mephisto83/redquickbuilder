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
    public class AccountController : RedAuthorizationController<{{model}}>
    {
        public AccountController(
            UserManager<{{model}}> _userManager,
            SignInManager<{{model}}> _signInManager,
            ILogger<RedAuthorizationController<{{model}}>> _logger,
            IRedEmailSender _emailSender) :
            base(_userManager, _signInManager, _logger, _emailSender)
        {
        }


        [HttpGet]
        [AllowAnonymous]
        public override Task<IActionResult> Login(string returnUrl = null)
        {
            return base.Login(returnUrl);
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public override  Task<IActionResult> Login(RedLoginModel model, string returnUrl = null)
        {
            return base.Login(model, returnUrl);
        }

        [HttpGet]
        [AllowAnonymous]
        public override  Task<IActionResult> LoginWith2fa(bool rememberMe, string returnUrl = null)
        {
            return base.LoginWith2fa(rememberMe, returnUrl);
        }


        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public override  Task<IActionResult> LoginWith2fa(RedLoginWith2faViewModel model, bool rememberMe, string returnUrl = null)
        {
            return base.LoginWith2fa(model, rememberMe, returnUrl);
        }

        [HttpGet]
        [AllowAnonymous]
        public override  Task<IActionResult> LoginWithRecoveryCode(string returnUrl = null)
        {
            return base.LoginWithRecoveryCode(returnUrl);
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public  override Task<IActionResult> LoginWithRecoveryCode(RedLoginWithRecoveryCodeViewModel model, string returnUrl = null)
        {
            return  base.LoginWithRecoveryCode(model,  returnUrl);
        }

        [HttpGet]
        [AllowAnonymous]
        public override  IActionResult Lockout()
        {
            return base.Lockout();
        }

        [HttpGet]
        [AllowAnonymous]
        public  override IActionResult Register(string returnUrl = null)
        {
            return base.Register(returnUrl);
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public  override Task<IActionResult> Register(RedRegisterViewModel model, string returnUrl = null)
        {
            return base.Register(model, returnUrl);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public  override Task<IActionResult> Logout()
        {
            return base.Logout();
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public override  IActionResult ExternalLogin(string provider, string returnUrl = null)
        {
            return base.ExternalLogin(provider, returnUrl);
        }

        [HttpGet]
        [AllowAnonymous]
        public  override Task<IActionResult> ExternalLoginCallback(string returnUrl = null, string remoteError = null)
        {
            return base.ExternalLoginCallback(returnUrl, remoteError);
        }



        public override {{model}} CreateUser(RedExternalLoginViewModel model)
        {
            return {{namespace}}.Models.{{model}}.Create(model);
        }

        public override {{model}} CreateUser(RedRegisterViewModel model)
        {
            return {{namespace}}.Models.{{model}}.Create(model);
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public  override Task<IActionResult> ExternalLoginConfirmation(RedExternalLoginViewModel model, string returnUrl = null)
        {
            return base.ExternalLoginConfirmation(model, returnUrl);
        }

        [HttpGet]
        [AllowAnonymous]
        public  override Task<IActionResult> ConfirmEmail(string userId, string code)
        {
            return base.ConfirmEmail(userId, code);
        }

        [HttpGet]
        [AllowAnonymous]
        public override  IActionResult ForgotPassword()
        {
            return base.ForgotPassword();
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public override  Task<IActionResult> ForgotPassword(RedForgotPasswordViewModel model)
        {
            return base.ForgotPassword(model);
        }

        [HttpGet]
        [AllowAnonymous]
        public override  IActionResult ForgotPasswordConfirmation()
        {
            return base.ForgotPasswordConfirmation();
        }

        [HttpGet]
        [AllowAnonymous]
        public override  IActionResult ResetPassword(string code = null)
        {
            return base.ResetPassword(code);
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public  override Task<IActionResult> ResetPassword(RedResetPasswordViewModel model)
        {
            return base.ResetPassword(model);
        }

        [HttpGet]
        [AllowAnonymous]
        public  override IActionResult ResetPasswordConfirmation()
        {
            return base.ResetPasswordConfirmation();
        }


        [HttpGet]
        public override  IActionResult AccessDenied()
        {
            return base.AccessDenied();
        }

        #region Helpers

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
        }

        private IActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            else
            {

                return RedirectToAction(configService.GetHomeAction(), configService.GetHomeController());
            }
        }
        #endregion Helpers
    }
}
