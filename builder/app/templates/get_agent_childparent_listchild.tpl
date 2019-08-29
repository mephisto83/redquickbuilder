
        public async Task<IList<{{model_output}}>> {{function_name}}({{user}} {{user_instance}}, {{value_type}} value) 
        { 
            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});
            var model = await arbiter{{parent}}.Get<{{parent}}>(value);
            if(await {{agent#lower}}Permissions.{{permission_function}}(model, agent).ConfigureAwait(false)) {
                var predicate = Pred.And({{predicates}});
                var list = await arbiter{{model_output}}.GetBy(predicate);
                return {{agent_type}}Return.{{filter_function}}(list, agent);
            }
            
            throw new PermissionException();
        }
