        //Templated version.
        public async Task<{{model}}> {{function_name}}({{user}} user, string value) { 

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});
            var model =  await arbiter{{model}}.Get<{{model}}>(value);
            if(await {{agent_type#lower}}Permissions.{{permission_function}}(model, agent).ConfigureAwait(false)) {
                return {{agent_type}}Return.{{filter_function}}(model, agent);
            }
            throw new PermissionException();
        }