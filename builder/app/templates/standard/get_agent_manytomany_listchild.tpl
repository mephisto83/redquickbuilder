
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{value_type}} value) 
        { 
            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});
            var parent = await arbiter{{parent_type}}.Get<{{parent_type}}>(value);
            if(await {{agent}}Permissions.{{permission_function}}(agent, parent).ConfigureAwait(false)) {
                var basicConnectionPred = {{connect_type}}Get.Get{{connect_type}}(parent);
                var predicate = Pred.And(basicConnectionPred{{comma}} {{predicates}});
                var connections = await arbiter{{connect_type}}.GetBy(predicate);
                var list = await arbiter{{model}}.GetBy({{connect_type}}Get.Get{{model}}(connections));

                return {{agent_type}}Return.{{filter_function}}(list, agent);
            }

            throw new PermissionException();
        }
