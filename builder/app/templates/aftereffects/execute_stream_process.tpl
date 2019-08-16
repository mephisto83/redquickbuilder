
        // [AfterEffectsTemplate.ExecuteStreamProcess]
        private async Task {{function_name}}({{agent}} agent, {{model}} result)
        {
            var parameters = {{model_output}}ChangeBy{{agent}}.{{method_type}}(agent, result, FunctionName.{{method}});

            await StreamProcess.{{model_output}}_{{agent}}(parameters);
        }
