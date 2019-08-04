
        public  async Task<{{model}}> {{method}}({{model}} data, {{agent}} agent, {{change}}ChangeBy{{agent}} change)
        {
            switch(change.FunctionName)
            {
{{cases}}
                default:
                    throw new NotImplementedException();
            }
        }