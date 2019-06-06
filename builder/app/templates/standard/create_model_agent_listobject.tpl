        // Assuming that the agent's id is used as the owner;
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

            var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

            if(await {{agent}}Permissions.CanCreate{{model}}({{agent}}, {{value}}).ConfigureAwait(false)) {

                var parameters = {{model}}Change.Create({{agent}}, {{value}});

                var result = await StreamProcess.{{model}}<{{agent_type}}>(parameters);

                return await arbiter{{model}}.GetOwnedBy<{{model}}>({{agent}}.Id);
            }
            
            return null;
        }