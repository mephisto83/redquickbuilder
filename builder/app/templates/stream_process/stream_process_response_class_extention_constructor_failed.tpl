
        public static {{agent_type}}Response {{method}}FailedOnException({{model}}ChangeBy{{agent_type}} change, Exception e) 
        {
            return new {{agent_type}}Response {
                Response = change.Response,
                ChangeType = change.ChangeType,
                ExceptionRaised = true,
                AgentType = change.AgentType,
                AgentId = change.AgentId,
                ExceptionMessage = e.Message,
                Failed = true
            };
        }

        public static {{agent_type}}Response {{method}}FailedOnValidation({{model}}ChangeBy{{agent_type}} change) 
        {
            return new {{agent_type}}Response {
                Response = change.Response,
                ValidationFailure = true,
                AgentType = change.AgentType,
                AgentId = change.AgentId,
                ChangeType = change.ChangeType,
                Failed = true
            };
        }
