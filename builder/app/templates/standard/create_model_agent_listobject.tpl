        // Assuming that the agent's id is used as the owner;
        public async Task<IList<{{model}}>> {{function_name}}({{user}} user, {{model}} value) { 

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

            if(await {{agent}}Permissions.{{permission_function}}(agent, value).ConfigureAwait(false)) {

                var parameters = {{model}}Change.Create(agent, value, FunctionName.{{function_name}});

                var result = await StreamProcess.{{model}}<{{agent_type}}>(parameters);

                if(result.Failed) 
                {
                    {{agent_type}}Exceptions.ThrowException(result);
                }
                else {
                
                    var list = await arbiter{{model}}.GetBy({{agent_type}}Get.Get{{model}}(agent));

                    return {{agent_type}}Return.{{filter_function}}(list, agent);
                }
            }
            
            throw new PermissionException();
        }