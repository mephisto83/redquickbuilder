        //Templated version.
        public async Task<IList<{{model}}>> {{function_name}}({{user}} user, {{model}} value) { 

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

            if(await {{agent_type}}Permissions.{{permission_function}}(agent, value).ConfigureAwait(false))) {
                var parameters = {{model}}Change.Delete(agent, value, FunctionName.{{function_name}});

                var result = await StreamProcess.{{model}}<{{agent_type}}>(parameters);

                return await {{model}}Arbiter.GetOwnedBy(agent.Id);
            }
            throw new PermissionException();
        }
