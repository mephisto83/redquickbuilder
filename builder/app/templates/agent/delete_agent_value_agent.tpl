//Templated version.
public async Task<bool> Delete{{agent_type}}({{user}} {{user_instance}}, {{agent_type}} {{value}}) { 

    var {{agent}} = await arbiter{{agent_type}}.GetByOwnerId<{{agent_type}}>({{user_instance}}.Id);

    if(await {{agent_type}}Permissions.CanDelete{{agent_type}}({{agent}} , {{value}}).ConfigureAwait(false))) {

        var parameters = {{agent_type}}ChangeParameters.Delete({{agent}}, {{value}});

        // The newConversation could be added to the result, if the caching option is used. then we wouldnt have to wait for the caching stream to complete.
        var result = await StreamProcess.{{agent_type}}(parameters);

        // This is probably going to be pretty slow.
        return result.Value;
    }
    
    return false;
}
