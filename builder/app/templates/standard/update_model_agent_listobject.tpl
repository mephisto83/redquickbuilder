//Updates a {{model}} type and returns the updated instance.
public async Task<{{model}}> {{function_name}}({{user}} user, {{model}} value) {

    if(user.{{agent_type}} == null) {
              throw new InvalidAgentException();
    }

    var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

    if(await {{agent_type#lower}}Permissions.{{permission_function}}(value, agent).ConfigureAwait(false)) {

        var parameters = {{model}}ChangeBy{{agent_type}}.Update(agent, value, FunctionName.{{default_executor_function_name}});

        var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

        return await arbiter{{model}}.Get<{{model}}>(result.IdValue);
    }
    throw new PermissionException();
}
