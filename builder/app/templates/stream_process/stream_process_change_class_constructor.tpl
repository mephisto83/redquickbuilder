
        // Per {{method}}
        public static {{model}}ChangeBy{{agent_type}} {{method}}({{agent_type}} acting{{agent}}, {{model}} data, string functionName) 
        {
            var result = new {{model}}ChangeBy{{agent_type}}();
            result.AgentType = acting{{agent}}.GetType().FullName;
            result.StreamType = data.GetType().FullName;
            result.AgentId = acting{{agent}}.Id;
            result.Data = data;
            result.ChangeType = {{change_type}};
            result.FunctionName = functionName;
            WorkTaskService = WorkTaskService ?? RedStrapper.Resolve<IWorkTaskService>();
            result.WorkTask = WorkTaskService.GetWorkTaskFor(result.StreamType, result.AgentType, result.ChangeType, result.FunctionName);
            return result;
        }