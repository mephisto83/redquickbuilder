        public async Task<{{model}}> {{function_name}}({{user}} user, {{model}} value) { 

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

            if(await {{agent}}Permissions.CanCreate{{model}}(agent, value).ConfigureAwait(false)) {

                var parameters = {{model}}Change.Create(agent, value, FunctionName.{{function_name}});

                var result = await StreamProcess.{{model}}<{{agent_type}}>(parameters);

                return await arbiter{{model}}.Get<{{model}}>(result.Id);
            }
            return null;
        }