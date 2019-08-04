        public static async Task<{{agent_type}}Response> {{model}}_{{agent_type}}({{model}}ChangeBy{{agent_type}} change, bool noWait = false)
        {
            change.StreamType = StreamType.{{model#allupper}};
            var stagedChangeResponse = await Stream<{{model}}ChangeBy{{agent_type}}, {{agent_type}}Response>(change, noWait);
            return stagedChangeResponse;
        }
