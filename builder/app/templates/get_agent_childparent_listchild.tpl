
        public async Task<IList<{{model}}>> {{function.codeName}}({{user}} {{user_instance}}, {{value_type}} value) 
        { 
            var agent = await arbiter{{agent_type}}.Get({{user}}.{{agent_type}});
            if(await {{can.function.codeName}}(agent, value).ConfigureAwait(false))) {
                return await arbiter.GetBy<{{model}}>(x => x.{{determining_property}} == value.{{parentIdProperty}});
            }
            return new List<{{model}}>();
        }
