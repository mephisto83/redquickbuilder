        //Get the default {{model}} with a parent reference of {{parent}}.
        public async Task<{{model}}> {{function_name}}({{user}} user, string parent) {

            if(user.{{agent_type}} == null) {
              throw new InvalidAgentException();
            }

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});
            var parentModel = await arbiter{{parent}}.Get<{{parent}}>(parent);
            if(await {{agent_type#lower}}Permissions.{{permission_function}}(agent, parentModel).ConfigureAwait(false)) {
                var result = {{model}}.GetDefaultModel();
                if(result != null) {
                  result.{{parent}} = parent;
                  return result;
                }
                throw new Exception("Couldnt build default {{parent}} model.");
            }
            throw new PermissionException();
        }
