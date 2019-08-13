
        // Per {{method}}
        public static {{model}}ChangeBy{{agent_type}} {{method}}({{agent_type}} agent, {{model}} reference, {{model_update}} data, string functionName) 
        {
        
            var result = new {{model}}ChangeBy{{agent_type}}();
            result.AgentType = agent.GetType().FullName;
            result.AgentId = agent.Id;
            result.Data = reference;
            result.{{model_update}} = data;
            result.ChangeType = {{change_type}};
            result.FunctionName = functionName;
            return result;
        }