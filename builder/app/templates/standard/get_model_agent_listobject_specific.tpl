
        public async Task<IList<{{model_output}}>> {{function_name}}({{user}} {{user_instance}}, IList<string> value)
        {
            if(user.{{agent_type}} == null) {
              throw new InvalidAgentException();
            }

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});
            if(await {{agent#lower}}Permissions.{{permission_function}}(agent).ConfigureAwait(false)) {
                var list = await arbiter{{model_output}}.GetBy(x => value.Contains(x.Id));
                return {{agent_type}}Return.{{filter_function}}(list, agent);
            }

            throw new PermissionException();
        }
