        //Templated version.
        public async Task<IList<{{model_output}}>> {{function_name}}({{user}} user, string m2m_reference, string selection_ref_id) { 

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});
            var m2m = await arbiter{{model}}.Get<{{model}}>(m2m_reference);

            if(await {{agent_type#lower}}Permissions.{{permission_function}}(agent, m2m).ConfigureAwait(false)) {
                var parameters = {{model}}ChangeBy{{agent_type}}.Delete(agent, m2m, FunctionName.{{function_name}});

                var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

                var predicate = Pred.And({{predicates}});
                var list = await arbiter{{model_output}}.GetBy(predicate);
                return list;
            }
            throw new PermissionException();
        }
