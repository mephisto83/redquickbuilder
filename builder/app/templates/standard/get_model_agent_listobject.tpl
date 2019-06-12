        //Templated version.
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{model}} value) { 

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

            if(await {{agent_type#lower}}Permissions.CanGet{{model}}(agent, value).ConfigureAwait(false))) {
                return await arbiter{{model}}.GetOwnedBy<{{model}}>(agent.Id);
            }
            return null;
        }