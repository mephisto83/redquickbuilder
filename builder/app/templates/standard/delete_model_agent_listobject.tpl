        //Deletes a model of type {{model}} and return the list defined by a predicate.
        public async Task<IList<{{model}}>> {{function_name}}({{user}} user, {{model}} model) {

            if(user.{{agent_type}} == null) {
              throw new InvalidAgentException();
            }

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

            if(await {{agent_type#lower}}Permissions.{{permission_function}}(model, agent).ConfigureAwait(false)) {
                var parameters = {{model}}ChangeBy{{agent_type}}.Delete(agent, model, FunctionName.{{default_executor_function_name}});

                var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

                var predicate = Pred.And({{predicates}});
                var list = await arbiter{{model}}.GetBy(predicate);
                return list;
            }
            throw new PermissionException();
        }
