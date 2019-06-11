    public class {{model}}Attribute : RuleAttribute
    {
        public {{model}}Attribute()
        {
            Method = FunctionName.{{function_name}};
        }
        public async Task<bool> IsOk({{type}} value)
        {
            var result = true;

{{properties}}

            return result;
        }
    }