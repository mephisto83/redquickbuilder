//Templated version.
public async Task<{{model}}> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

    var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

    if(await {{agent_type}}Permissions.CanGet{{model}}({{agent}}, {{value}}).ConfigureAwait(false))) {
        var parameters = {{model}}Change.Delete({{customer}}, {{value}});

        var result = await StreamProcess.{{model}}(parameters);

        return result.Value;
    }
    return null;
}
