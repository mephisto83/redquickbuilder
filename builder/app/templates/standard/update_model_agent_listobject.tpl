//Templated version.
public async Task<{{model}}> {{function_name}}({{user}} user, {{model}} value) { 

    var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

    if(await {{agent_type#lower}}Permissions.{{permission_function}}(value, agent).ConfigureAwait(false)) {

        var parameters = {{model#lower}}ChangeBy{{agent_type}}.Update<{{agent_type}}>(agent, value, FunctionName.{{function_name}});

        var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

        return await arbiter{{model}}.Get<{{model}}>(result.Id);
    }
    throw new PermissionException();
}