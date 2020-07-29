        // Gets a {{model}} type instance with the id.
        public async Task<{{model}}> {{function_name}}({{user}} user, string value) {

            if(user.{{agent_type}} == null) {
              throw new InvalidAgentException();
            }

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});
            var model =  await arbiter{{model}}.Get<{{model}}>(value);
            if(await {{agent_type#lower}}Permissions.{{permission_function}}(model, agent).ConfigureAwait(false)) {
                return {{agent_type}}Return.{{filter_function}}(model, agent);
            }
            throw new PermissionException();
        }
