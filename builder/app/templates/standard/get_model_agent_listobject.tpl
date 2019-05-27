//Templated version.
public async Task<IList<{{model}}>> Get{{model}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

    var {{agent}} = await arbiter{{agent_type}}.GetByOwnerId<{{agent_type}}>({{user_instance}}.Id);

    if(await {{agent_type}}Permissions.CanGet{{model}}({{agent}} , {{value}}).ConfigureAwait(false))) {
        return await arbiter{{model#upper}}.GetByOwnerId<{{model}}>({{agent}}.Id);
    }
    return null;
}