
            /// <summary>
            ///  Creates a "many 2 many"(m2m) object, and returns the updated set of m2m objects.
            /// </summary>
            /// <param name="{{user}}">user</param>
            /// <param name="{{model}}">model</param>
            /// <returns>IList<{{model}}></returns>
            public async Task<IList<{{model}}>> {{function_name}}({{user}} user, {{model}} model) 
            { 
                var agent = await arbiter{{agent_type}}.Get<{{agent_type}}>(user.{{agent_type}});

                if(await {{agent}}Permissions.{{permission_function}}(model, agent).ConfigureAwait(false)) {
                    var parameters = {{model}}ChangeBy{{agent_type}}.Create(agent, model, FunctionName.{{function_name}});
                    var result = await StreamProcess.{{model}}_{{agent_type}}(parameters);

                    if(result.Failed) 
                    {
                        {{agent_type}}Exceptions.ThrowException(result);
                    }
                    else {
                        var predicate = Pred.And({{predicates}});
                        var list = await arbiter{{model}}.GetBy(predicate);

                        return {{agent_type}}Return.{{filter_function}}(list, agent);
                    }
                }
                
                throw new PermissionException();
            }
