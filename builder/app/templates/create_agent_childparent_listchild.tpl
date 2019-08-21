            public async Task<IList<{{model_output}}>> {{function_name}}({{user}} user, {{model}} model) 
            { 
                var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

                if(await {{agent#lower}}Permissions.{{permission_function}}(model, agent).ConfigureAwait(false)) {
                    var parameters = {{model}}ChangeBy{{agent_type}}.Create(agent, model, FunctionName.{{function_name}});
                    var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

                    if(result.Failed) 
                    {
                        {{agent_type}}Exceptions.ThrowException(result);
                    }
                    else {
                    
                    
                        {{parent_setup}}
                        var predicate = Pred.And({{predicates}});
                        var list = await arbiter{{model_output}}.GetBy(predicate);
                        
                        return {{agent_type}}Return.{{filter_function}}(list, agent);
                    }
                }
                
                throw new PermissionException();
            }