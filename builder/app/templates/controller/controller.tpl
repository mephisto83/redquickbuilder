    [Route("api/{{codeName#alllower}}")]
    [ApiController]
    public class {{codeName}} : ControllerBase
    {
        {{user}} _{{user_instance}};

        public {{user}} {{user_instance}}
        {
           get
           {
             if(_{{user_instance}} == null) {
               var claimService = RedStrapper.Resolve<ICreateUser>();
               var claims =  ((System.Security.Claims.ClaimsIdentity)(User.Identity)).Claims;
               _{{user_instance}} = claimService.Create(claims);
             }
             return _{{user_instance}};
           }

           set
           {
             _{{user_instance}} = value;
           }
        }
        {{functions}}
    }
