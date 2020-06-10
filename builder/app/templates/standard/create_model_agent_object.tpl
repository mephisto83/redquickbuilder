        public async Task<{{model}}> {{function_name}}({{user}} user, {{model}} value) {

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

            if(await {{agent#lower}}Permissions.{{permission_function}}(value, agent).ConfigureAwait(false)) {

                var parameters = {{model}}ChangeBy{{agent_type}}.Create(agent, value, FunctionName.{{default_executor_function_name}});

                var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

                var model_output = await arbiter{{model}}.Get<{{model}}>(result.IdValue);

                {{lambda.default}}
            }
            throw new PermissionException();
        }
