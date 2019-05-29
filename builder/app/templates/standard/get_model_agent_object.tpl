//Templated version.
public async Task<{{model}}> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

    var {{agent}} = await arbiter{{agent_type}}.GetByOwnerId<{{agent_type}}>({{user_instance}}.Id);

    if(await {{agent_type}}Permissions.CanGet{{model}}({{agent}} , {{value}}).ConfigureAwait(false))) {
        return await arbiter{{model#upper}}.Get<{{model}}>({{value}}.Id);
    }
    return null;
}