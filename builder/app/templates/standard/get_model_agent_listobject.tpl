        //Get {{model}} by matching properties in a
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{model}} model) { 

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

            if(await {{agent_type#lower}}Permissions.{{permission_function}}(model, agent).ConfigureAwait(false)) {
                var predicate = Pred.And({{predicates}});
                var list = await arbiter{{model_output}}.GetBy(predicate);
                return {{agent_type}}Return.{{filter_function}}(list, agent);

            }
            throw new PermissionException();
        }