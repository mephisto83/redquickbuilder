
        public async Task<IList<{{model_output}}>> {{function_name}}({{user}} {{user_instance}}, {{value_type}} value, QueryParameters queryParameter = null) 
        { 
            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});
            var parent = await arbiter{{parent}}.Get<{{parent}}>(value);
            if(await {{agent#lower}}Permissions.{{permission_function}}(parent, agent).ConfigureAwait(false)) {
                var predicate = Pred.And({{predicates}});
                var list = await arbiter{{model_output}}.GetBy(predicate, RedQueryFunctions.Take(queryParameter), RedQueryFunctions.Skip(queryParameter));
                return {{agent_type}}Return.{{filter_function}}(list, agent);
            }
            
            throw new PermissionException();
        }
