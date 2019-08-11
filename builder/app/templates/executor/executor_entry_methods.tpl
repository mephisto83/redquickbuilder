
        public  async Task<{{model_output}}> {{method}}({{model}} data, {{agent}} agent, {{change}}ChangeBy{{agent}} change)
        {
            switch(change.FunctionName)
            {
{{cases}}
                default:
                    throw new NotImplementedException();
            }
        }