        public async Task<IList<{{model}}>> {{function_name}}({{user}} user, {{model}} value) 
        {

            var agent = await {{agent_type#lower}}Arbiter.GetOwnedBy<{{agent_type}}>(user.{{agent_type}});
            if(await {{agent_type#lower}}Permissions.{{permission_function}}(value, agent).ConfigureAwait(false))) {
                var {{model#lower}}Change = {{model}}Parameters.Update(agent, value);
                var {{model#lower}}Change = {{model#lower}}Change.Create({{model}}Change);
                await StreamProcess.{{model}}({{model}}Change);

                return await {{model#lower}}Arbiter.GetBy<{{model}}>(x => x.{{determining_property}} == value.{{parentIdProperty}});
            }
            return new List<{{model}}>();
        }