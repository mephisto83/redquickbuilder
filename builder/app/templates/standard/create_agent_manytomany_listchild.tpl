            public async Task<IList<{{model}}>> {{function_name}}({{user}} user, {{model}} model) 
            { 
                var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

                if(await {{agent}}Permissions.{{permission_function}}(agent, model).ConfigureAwait(false)) {
                    var parameters = {{model}}ChangeBy{{agent_type}}.Create(agent, model, FunctionName.{{function_name}});
                    var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

                    if(result.Failed) 
                    {
                        {{agent_type}}Exceptions.ThrowException(result);
                    }
                    else {
                        {{parent_setup}}
                        var predicate = Pred.And({{predicates}});
                        var list = await arbiter{{model}}.GetBy(predicate);

                        return {{agent_type}}Return.{{filter_function}}(list, agent);
                    }
                }
                
                throw new PermissionException();
            }