//Templated version.
public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

    var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

    if(await {{agent_type}}Permissions.CanDelete{{model}}({{agent}}, {{value}}).ConfigureAwait(false))) {
        var parameters = {{model}}Change.Delete({{customer}}, {{value}}, FunctionName.{{function_name}});

        var result = await StreamProcess.{{model}}<{{agent_type}}>(parameters);

        return await {{model}}Arbiter.GetOwnedBy({{agent}}.Id);
    }
    return null;
}
