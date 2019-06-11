
        public static async Task<{{model}}> {{method}}({{model}} data, {{agent}} agent, {{change}}Change change)
        {
            switch(change.FunctionName)
            {
{{cases}}
                default:
                    throw new NotImplementedException();
            }
        }