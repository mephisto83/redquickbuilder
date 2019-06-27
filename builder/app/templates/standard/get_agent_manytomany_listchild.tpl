
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{value_type}} value) 
        { 
            var agent = await arbiter{{agent_type}}.Get({{user_instance}}.{{agent_type}});
            if(await {{agent}}Permissions.{{permission_function}}(agent, value).ConfigureAwait(false))) {
                return await arbiter.GetBy<{{model}}>(x => x.{{determining_property}} == value.{{parentIdProperty}});
            }

            throw new PermissionException();
        }
