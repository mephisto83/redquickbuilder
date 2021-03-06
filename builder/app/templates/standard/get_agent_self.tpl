        // Gets a {{model}} type instance with the id.
        public async Task<{{model}}> {{function_name}}({{user}} user) {

            if(user.{{agent_type}} == null) {
              throw new InvalidAgentException();
            }
            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});
            if(await {{agent_type#lower}}Permissions.{{permission_function}}(agent).ConfigureAwait(false)) {
                return {{agent_type}}Return.{{filter_function}}(agent, agent);
            }
            return null;
        }
