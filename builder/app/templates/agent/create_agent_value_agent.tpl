//Templated version.
public async Task<{{agent_type}}> Create{{agent_type}}({{user}} {{user_instance}}, {{agent_type}} {{value}}) { 

    if(await {{user}}Permissions.CanCreate{{agent_type}}({{user_instance}} , {{value}}).ConfigureAwait(false)) {

        var parameters = {{agent_type}}Change.Create({{user_instance}}, {{agent_type}});

        var result = await StreamProcess.{{user}}(parameters);

        return await {{agent_type}}Arbiter.Get<{{agent_type}>(result.Id);
    }
    
    return null;
}