    public class {{model}}Attribute : RuleAttribute
    {
        public async Task<bool> IsOk({{type}} value)
        {
            var result = true;

{{properties}}

            return result;
        }
    }