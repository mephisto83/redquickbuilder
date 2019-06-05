public async Task<{{model}}> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

    var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

    if(await {{agent}}Permissions.CanCreate{{model}}({{agent}}, {{value}}).ConfigureAwait(false)) {

        var parameters = {{model}}Change.Create({{agent}}, {{value}});

        var result = await StreamProcess.{{model}}(parameters);

        return await arbiter{{model}}.Get<{{model}}>(result.Id);
    }
    return null;
}