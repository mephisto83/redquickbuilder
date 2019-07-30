        //Templated version.
        public async Task<{{model}}> {{function_name}}({{user}} user, string value) { 

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});
            var model =  await arbiter{{model}}.Get<{{model}}>(value);
            if(await {{agent_type#lower}}Permissions.{{permission_function}}(agent, model).ConfigureAwait(false)) {
                return model;
            }
            throw new PermissionException();
        }