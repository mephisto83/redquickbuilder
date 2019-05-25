[Authorize]
[RoutePrefix("api/{{codeName#alllower}}")]
public class {{codeName}} : BaseController
{
    {{functions}}
}