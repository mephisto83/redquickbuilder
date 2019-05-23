public async Task<IList<{{model}}>> {{function.codeName}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

    var {{agent#lower}} = await {{agent_type#lower}}Arbiter.GetByOwnerId<{{agent_type}}>({{user}}.Id);
    if(await {{can.function.codeName}}({{agent#lower}}, {{value}}).ConfigureAwait(false))) {
        var {{model#lower}}ChangeParameters = Create{{model}}Parameters.Create({{agent#lower}}, {{value}});
        var {{model#lower}}Change = {{model#lower}}Change.Create({{model}}ChangeParameters);
        await StreamProcess.{{model}}({{model}}Change);

        return await {{model#lower}}Arbiter.GetBy<{{model}}>(x => x.{{determining_property}} == {{value}}.{{parentIdProperty}});
    }
    return new List<{{model}}>();
}