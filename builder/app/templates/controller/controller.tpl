    [Authorize]
    [RoutePrefix("api/{{codeName#alllower}}")]
    public class {{codeName}}Controller : BaseController
    {
        {{functions}}
    }