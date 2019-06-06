        public static async Task<{{agent_type}}Response> {{model}}<{{agent_type}}>({{model}}Change change, bool noWait = false)
        {
            change.StreamType = StreamType.{{model#allupper}};
            var stagedChangeResponse = await Stream<{{model}}Change, {{agent_type}}Response>(change, noWait);
            return stagedChangeResponse;
        }
