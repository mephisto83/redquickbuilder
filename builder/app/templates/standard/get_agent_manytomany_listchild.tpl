
        // Get agent many to many => listchild
        public async Task<IList<{{model_output}}>> {{function_name}}({{user}} {{user_instance}}, string value) 
        { 
            var agent = await arbiter{{agent}}.Get<{{agent}}>({{user_instance}}.{{agent}});
            var model = await arbiter{{model}}.Get<{{model}}>(value);
            if(await {{agent}}Permissions.{{permission_function}}(model, agent).ConfigureAwait(false)) {
                var basicConnectionPred = {{connect_type}}Get.Get{{connect_type}}(parent);
                var predicate = Pred.And(basicConnectionPred{{comma}} {{predicates}});
                var connections = await arbiter{{connect_type}}.GetBy(predicate);
                var list = await arbiter{{model_output}}.GetBy({{connect_type}}Get.Get{{model_output}}(connections));

                return {{agent}}Return.{{filter_function}}(list, agent);
            }

            throw new PermissionException();
        }
