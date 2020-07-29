        public async Task<{{model}}> {{function_name}}({{user}} user) {

            if(user.{{agent_type}} == null) {
              throw new InvalidAgentException();
            }

            var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

            var value = {{model}}.Create();

            if(await {{agent#lower}}Permissions.{{permission_function}}(value, agent).ConfigureAwait(false)) {

                var list = await arbiter{{model}}.GetBy(x => x.Owner == agent.Id);
                if(list != null && list.Count > 0) {
                  if(list.Count > 1) {
                    var todelete = list.OrderByDescending(x => x.Created).Skip(1);
                    foreach(var item in todelete) {
                      var temp_parameters = {{model}}ChangeBy{{agent_type}}.Delete(agent, item, FunctionName.{{executor_delete_name}});
                      await StreamProcess.{{model}}_{{agent_type}}(temp_parameters, true);
                    }
                  }
                  return list.First();
                }
                var parameters = {{model}}ChangeBy{{agent_type}}.Create(agent, value, FunctionName.{{executor_create_name}});

                var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

                var model_output = await arbiter{{model}}.Get<{{model}}>(result.IdValue);

                {{lambda.default}}
            }
            throw new PermissionException();
        }
