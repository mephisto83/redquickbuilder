            public async Task<IList<{{model}}>> {{function.codeName}}({{user}} user, {{model}} value) 
            { 
                var agent = await {{agent_type#lower}}Arbiter.Get(user.{{agent_type}});
                if(await {{can.function.codeName}}(agent, value).ConfigureAwait(false))) {
                    var {{model#lower}}Change = {{model}}Parameters.Create(agent, value);
                    var {{model#lower}}Change = {{model}}Change.Create({{model#lower}}Change);
                    await StreamProcess.{{model}}({{model#lower}}Change);

                    return await {{model#lower}}Arbiter.GetBy<{{model}}>(x => x.{{determining_property}} == value.{{determining_property}});
                }
                return new List<{{model}}>();
            }