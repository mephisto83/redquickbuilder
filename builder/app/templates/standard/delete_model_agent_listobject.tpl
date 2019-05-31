//Templated version.
public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

    var {{agent}} = await arbiter{{agent_type}}.GetByOwnerId<{{agent_type}}>({{user_instance}}.Id);

    if(await {{agent_type}}Permissions.CanDelete{{model}}({{agent}}, {{value}}).ConfigureAwait(false))) {
        var parameters = {{model}}ChangeParameters.Delete({{customer}}, {{value}});

        var result = await StreamProcess.{{model}}(parameters);

        return await {{model}}Arbiter.GetByOwnerId({{agent}}.Id);
    }
    return null;
}
