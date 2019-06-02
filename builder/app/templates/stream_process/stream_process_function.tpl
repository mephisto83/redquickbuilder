        public static async Task<{{model}}StagedResponse> {{model}}({{model}}Change change, bool noWait = false)
        {
            change.StreamType = StreamType.{{model#allupper}};
            var stagedChangeResponse = await Stream(change, noWait);
            return stagedChangeResponse;
        }
