public class Validator : IValidator<{{model}}, {{agent_type}}> {
    // validator.Validate<{{model}}, {{agent_type}}>(data, agent);

    public async Task<bool> Validate<{{model}}, {{agent_type}}({{model} value, {{agent_type}} {{agent}}, {{string}} methodType) {
         var attrs = value.GetType()
                        .GetCustomAttributes(true)
                        .Where(e => e is ValidationAttribute)
                        .Select(x => x as ValidationAttribute);
        
        foreach (var attr in attrs)
        {
            if (!await attr.CanExecute(agent, value, methodType))
            {
                return false;
            }
        }

        return true;
    }
}