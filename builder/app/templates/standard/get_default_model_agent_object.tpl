        //Templated version.
        public async Task<{{model}}> {{function_name}}({{user}} user) {

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});
            if(await {{agent_type#lower}}Permissions.{{permission_function}}(model, agent).ConfigureAwait(false)) {
                return  {{model}}.GetDefaultModel();
            }
            throw new PermissionException();
        }
