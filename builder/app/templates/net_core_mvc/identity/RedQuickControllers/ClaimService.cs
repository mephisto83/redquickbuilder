using Microsoft.IdentityModel.Tokens;
using RedQuick.Data;
using RedQuick.Interfaces.Arbiter;
using RedQuick.Util;
using RedQuickCore.Interfaces;
using {{namespace}}.Models;
using {{namespace}}.Interface;
using {{namespace}}.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace {{namespace}}.Controllers
{
    public interface ICreateUser
    {
      {{model}} Create(IEnumerable<Claim> claimList);
    }

{{claim_service_interfaces}}

    public class ClaimService : IClaimService<{{model}}>, ICreateUser{{more_interfaces}}
    {
        public {{model}} Create(IEnumerable<Claim> claimList)
        {
          var result = {{model}}.Create();
          foreach (var claim in claimList)
          {
              {{create_properties}};

              if(claim.Type == "UserName")
              {
                result.UserName = claim.Value;
              }
          }
          return result;
        }

        public async Task<IList<Claim>> CreateClaims({{model}} user)
        {
            var result = new List<Claim>();
{{children}}
            if (!string.IsNullOrEmpty(user.Id))
                result.Add(new Claim("Id", user.Id));
            if (!string.IsNullOrEmpty(user.UserName))
                result.Add(new Claim("UserName", user.UserName));

            return result;
        }

        public async Task<SecurityTokenDescriptor> CreateTokenDescriptor(IList<Claim> claimList, {{model}} user)
        {
            var configService = RedStrapper.Resolve<IRedConfiguration>();
            var key = Encoding.ASCII.GetBytes(configService.GetSecret());
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claimList.ToArray()),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            return tokenDescriptor;
        }
{{interface_implementations}}
    }
}
