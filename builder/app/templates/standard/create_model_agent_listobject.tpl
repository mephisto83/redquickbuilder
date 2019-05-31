        // Assuming that the agent's id is used as the owner;
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

            var {{agent}} = await arbiter{{agent_type}}.GetByOwnerId<{{agent_type}}>({{user_instance}}.Id);

            if(await {{agent}}Permissions.CanCreate{{model}}({{agent}}, {{value}}).ConfigureAwait(false))) {

                var parameters = {{model}}ChangeParameters.Create({{agent}}, {{value}});

                var result = await StreamProcess.{{model}}(parameters);

                return await arbiter{{model}}.GetByOwnerId<{{model}}>(agent.Id);
            }
            
            return null;
        }