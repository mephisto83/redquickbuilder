        //Templated version.
        public async Task<{{model}}> {{function_name}}({{user}} user, string parent) {

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});
            var parentModel = await arbiter{{parent}}.Get<{{parent}}>(parent);
            if(await {{agent_type#lower}}Permissions.{{permission_function}}(agent, parentModel).ConfigureAwait(false)) {
                let result = {{model}}.GetDefaultModel();
                if(result != null) {
                  result.{{parent}} = parent;
                  result.{{agent_type}} = agent.Id;
                  return result;
                }
                throw new Exception("Couldnt build default {{parent}} model.");
            }
            throw new PermissionException();
        }
