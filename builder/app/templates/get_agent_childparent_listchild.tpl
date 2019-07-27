
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{value_type}} value) 
        { 
            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});
            var parent = await arbiter{{parent_type}}.Get<{{parent_type}}>(value);
            if(await {{agent}}Permissions.{{permission_function}}(agent, parent).ConfigureAwait(false)) {
                var predicate = Pred.And({{predicates}});
                return await arbiter{{model}}.GetBy(predicate);
            }
            
            throw new PermissionException();
        }
