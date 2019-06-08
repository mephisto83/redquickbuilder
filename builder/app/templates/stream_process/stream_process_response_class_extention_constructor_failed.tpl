
        public static {{agent_type}}Response {{method}}Failed({{model}}Change change) 
        {
            return new {{agent_type}}Response {
                Response = change.Response,
                ChangeType = change.ChangeType,
                Failed = true
            };
        }
