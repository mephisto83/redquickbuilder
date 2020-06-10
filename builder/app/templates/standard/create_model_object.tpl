        public async Task {{function_name}}({{model}} model) {
                var agent = {{agent_type}}.Create();

                var parameters = {{model}}ChangeBy{{agent_type}}.Create(agent, model, FunctionName.{{default_executor_function_name}});

                await StreamProcess.{{model}}_{{agent_type}}(parameters);
        }
