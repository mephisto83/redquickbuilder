        // Gets a {{model}} type instance with the id.
        public async Task<{{model}}> {{function_name}}({{user}} user) {

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});
            if(await {{agent_type#lower}}Permissions.{{permission_function}}(agent).ConfigureAwait(false)) {
                return {{agent_type}}Return.{{filter_function}}(agent);
            }
            throw new PermissionException();
        }
