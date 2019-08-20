        //Templated version.
        public async Task<IList<{{model_output}}>> {{function_name}}({{user}} user, string modelId) { 

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});
            var model = await arbiter{{model}}.Get<{{model}}>(modelId);

            if(await {{agent_type#lower}}Permissions.{{permission_function}}(model, agent).ConfigureAwait(false)) {
                var parameters = {{model}}ChangeBy{{agent_type}}.Delete(agent, model, FunctionName.{{function_name}});

                var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

                var predicate = Pred.And({{predicates}});
                var list = await arbiter{{model_output}}.GetBy(predicate);
                return list;
            }
            throw new PermissionException();
        }
