    [Route("api/{{codeName#alllower}}")]
    [ApiController]
    public class {{codeName}}Controller : ControllerBase
    {
        {{user}} {{user_instance}};
        {{functions}}
    }