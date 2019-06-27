
        // Per {{method}}
        public static {{model}}Change {{method}}({{agent_type}} acting{{agent}}, {{model}} data, string functionName) 
        {
        
            var result = new {{model}}Change();
            result.AgentType = acting{{agent}}.GetType().FullName;
            result.AgentId = acting{{agent}}.Id;
            result.Data = data;
            result.ChangeType = {{change_type}};
            result.FunctionName = functionName;
            return result;
        }