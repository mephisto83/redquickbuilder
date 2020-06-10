        // Assuming that the agent's id is used as the owner;
        public async Task<{{model}}> {{function_name}}({{user}} user, {{composite-input}} model) {

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

            if(await {{agent#lower}}Permissions.{{permission_function}}(model, agent).ConfigureAwait(false)) {

                var parameters = {{composite-input}}ChangeBy{{agent_type}}.Create(agent, model, FunctionName.{{default_executor_function_name}});

                var result = await StreamProcess.{{composite-input}}_{{agent_type}}(parameters);

                if(result.Failed)
                {
                    {{agent_type}}Exceptions.ThrowException(result);
                }
                else {
                     var item = await arbiter{{model}}.Get<{{model}}>(result.IdValue);


                    return {{agent_type}}Return.{{filter_function}}(item, agent);
                }
            }

            throw new PermissionException();
        }
