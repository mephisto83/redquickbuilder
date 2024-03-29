        // Assuming that the agent's id is used as the owner;
        public async Task<IList<{{model}}>> {{function_name}}({{user}} user, {{model}} model) {

            if(user.{{agent_type}} == null) {
              throw new InvalidAgentException();
            }

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

            if(await {{agent#lower}}Permissions.{{permission_function}}(model, agent).ConfigureAwait(false)) {

                var parameters = {{model}}ChangeBy{{agent_type}}.Create(agent, model, FunctionName.{{default_executor_function_name}});

                var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

                if(result.Failed)
                {
                    {{agent_type}}Exceptions.ThrowException(result);
                }
                else {
                    {{parent_setup}}
                    var predicate = Pred.And({{predicates}});
                    var list = await arbiter{{model}}.GetBy(predicate);


                    return {{agent_type}}Return.{{filter_function}}(list, agent);
                }
            }

            throw new PermissionException();
        }
