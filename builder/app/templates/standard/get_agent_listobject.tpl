        //Templated version.
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}) { 

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

            if(await {{agent_type#lower}}Permissions.{{permission_function}}(value, agent).ConfigureAwait(false)) {
                var predicate = Pred.And({{predicates}});
                var list = await arbiter{{model}}.GetBy(predicate);
                return {{agent_type}}Return.{{filter_function}}(list, agent);
            }
            throw new PermissionException();
        }