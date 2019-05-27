public async Task {{agent_type}}Create({{model}}Change change) {
    {{agent_type}} agent = await {{agent_type}}Arbiter.Get(change.AgentId);
    {{model}} data = change.Data;
    if(await validator.Validate<{{model}}, {{agent_type}}>(data, agent, MethodType.CREATE)) {
        var result = await {{model}}Arbiter.Create(data);
        await {{model}}ResponseArbiter.Create({{model}}Response.Create(change, result));
    }
    else {
        await {{model}}ResponseArbiter.Create({{model}}Response.CreateFailed(change));
    }
}

public async Task {{agent_type}}Update({{model}}Change change) {
    {{agent_type}} agent = await {{agent_type}}Arbiter.Get(change.AgentId);
    {{model}} data = change.Data;
    if(await validator.Validate<{{model}}, {{agent_type}}>(data, agent, MethodType.UPDATE)) {
        var result = await {{model}}Arbiter.Update(data);
        await {{model}}ResponseArbiter.Create({{model}}Response.Create(change, result));
    }
    else {
        await {{model}}ResponseArbiter.Create({{model}}Response.UpdateFailed(change));
    }
}

public async Task {{agent_type}}Delete({{model}}Change change) {
    {{agent_type}} agent = await {{agent_type}}Arbiter.Get(change.AgentId);
    {{model}} data = change.Data;
    if(await validator.Validate<{{model}}, {{agent_type}}>(data, agent, MethodType.UPDATE)) {
        var result = await {{model}}Arbiter.Delete(data);
        await {{model}}ResponseArbiter.Create({{model}}Response.Delete(change, result));
    }
    else {
        await {{model}}ResponseArbiter.Create({{model}}Response.DeleteFailed(change));
    }
}