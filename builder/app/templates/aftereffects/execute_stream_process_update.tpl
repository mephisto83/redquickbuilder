
        private async Task {{function_name}}({{agent}} agent, {{reference_class}} data, {{model}} result)
        {

            var parameters = {{model_output}}ChangeBy{{agent}}.{{method_type}}(agent, data, result, FunctionName.{{method}});
            await StreamProcess.{{model_output}}_{{agent}}(parameters);
        }
