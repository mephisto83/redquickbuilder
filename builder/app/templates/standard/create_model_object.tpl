        public async Task {{function_name}}({{model}} model) { 

                var parameters = {{model}}Change.Create(agent, model, FunctionName.{{function_name}});

                await StreamProcess.{{model}}<{{agent_type}}>(parameters);
            }            
        }