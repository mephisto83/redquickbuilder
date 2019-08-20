        //Templated version.
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{model}} value) { 

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

            if(await {{agent_type#lower}}Permissions.{{permission_function}}(value, agent).ConfigureAwait(false)) {
                return await arbiter{{model}}.GetOwnedBy<{{model}}>(agent.Id);
            }
            throw new PermissionException();
        }