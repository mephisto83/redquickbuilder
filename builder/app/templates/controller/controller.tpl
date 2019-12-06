    [Route("api/{{codeName#alllower}}")]
    [ApiController]
    public class {{codeName}} : ControllerBase
    {
        {{user}} {{user_instance}};
        {{functions}}
    }