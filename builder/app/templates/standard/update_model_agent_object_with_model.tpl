//Templated version.
public async Task<{{model}}> {{function_name}}({{user}} user, string value, {{model_update}} update) {

    var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

    if(await {{agent_type#lower}}Permissions.{{permission_function}}(value, agent, update).ConfigureAwait(false)) {

        var parameters = {{model}}ChangeBy{{agent_type}}.Update(agent, value, update, FunctionName.{{function_name}});

        var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

        return await arbiter{{model}}.Get<{{model}}>(result.IdValue);
    }
    throw new PermissionException();
}
