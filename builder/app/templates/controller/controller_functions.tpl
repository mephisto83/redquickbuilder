[Route("{{http_route}}")]
[{{http_method}}]
public async Task<{{output_type}}> GetLiveServiceTasks([FromBody] {{input_type}} obj)
{
    var maestro = ProjectStrapper.Resolve<{{maestro_interface}}>();
    return await maestro.{{maestro_function}}({{user_instance}}, obj).ConfigureAwait(false);
}
