        //Templated version.
        public async Task<{{model}}> {{function_name}}({{user}} user, {{model}} value) { 

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

            if(await {{agent_type#lower}}Permissions.CanGet{{model}}(agent, value).ConfigureAwait(false))) {
                return await arbiter{{model}}.Get<{{model}}>(value.Id);
            }
            return null;
        }