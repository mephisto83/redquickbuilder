 //Templated version.
public async Task<{{agent_type}}> Get{{agent_type}}({{user}} {{user_instance}}, {{agent_type}} {{value}}) { 

    var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

    if(await {{agent_type}}Permissions.CanGet{{agent_type}}({{agent}} , {{value}}).ConfigureAwait(false))) {

        var parameters = {{agent_type}}Change.Get({{agent}}, {{value}});

        var result = await StreamProcess.{{agent_type}}(parameters);

        return await {{agent_type}}Arbiter.Get<{{agent_type}>(result.Id);
    }
    
    return null;
}