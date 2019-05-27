// Assuming that the agent's id is used as the owner;
public async Task<IList<{{model}}>> Create{{model}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

    var {{agent}} = await arbiter{{agent_type}}.GetByOwnerId<{{agent_type}}>({{user_instance}}.Id);

    if(await {{agent_type}}Permissions.CanCreate{{model}}({{agent}} , {{value}}).ConfigureAwait(false))) {

        var parameters = {{model}}ChangeParameters.Create({{agent}}, {{value}});

        var result = await StreamProcess.{{model}}(parameters);

        return await arbiter{{model#upper}}.GetByOwnerId<{{model}}>(agent.Id);
    }
    return null;
}