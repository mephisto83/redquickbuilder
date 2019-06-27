
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{value_type}} value) 
        { 
            var agent = await arbiter{{agent_type}}.Get({{user_instance}}.{{agent_type}});
            var parent = await arbiter{{parent_type}}.Get(value);
            if(await {{agent}}Permissions.{{permission_function}}(agent, parent).ConfigureAwait(false))) {
                return await arbiter.GetBy<{{model}}>({{model}}Get.Get{{model}}(parent));
            }
            
            throw new PermissionException();
        }
