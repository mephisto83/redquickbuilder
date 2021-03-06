//Deletes a {{model}}, and returns the deleted {{model}} instance.
public async Task<{{model}}> {{function_name}}({{user}} user, {{model}} value) {

    if(user.{{agent_type}} == null) {
      throw new InvalidAgentException();
    }

    var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

    if(await {{agent_type#lower}}Permissions.{{permission_function}}(agent, value).ConfigureAwait(false)) {
        var parameters = {{model}}ChangeBy{{agent_type}}.Delete({{customer}}, value, FunctionName.{{function_name}});

        var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

        return result.Value;
    }
    throw new PermissionException();
}
