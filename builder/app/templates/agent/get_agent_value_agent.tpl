//Templated version.
public async Task<{{agent_type}}> Get{{agent_type}}({{user}} {{user_instance}}, {{agent_type}} {{value}}) { 

    var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

    if(await {{agent_type}}Permissions.CanGet{{agent_type}}({{agent}} , {{value}}).ConfigureAwait(false))) {

        var parameters = {{agent_type}}Change.Get({{agent}}, {{value}});

        // The newConversation could be added to the result, if the caching option is used. then we wouldnt have to wait for the caching stream to complete.
        var result = await StreamProcess.{{agent_type}}(parameters);

        // This is probably going to be pretty slow.
        return await {{agent_type}}Arbiter.Get<{{agent_type}>(result.Id);
    }
    
    return null;
}