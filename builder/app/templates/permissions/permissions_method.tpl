        public Task<bool> Can{{method}}{{model}}({{agent_type}} {{agent}}, {{model}} {{value}}) {
            if(value == null) {
                return false;
            }
            if(agent == null){
                return false;
            }

            // var allowed{{extension}} = {{extension}}.List();

            var allowedCreateState = allowed{{extension}}.Any(x => x === value.State);
            var allowedCreateState = AllowedCreateStateValues.Any(x => x.Value === value.State);
            {{!-- var allowedCreateState = AllowedCreateStateValues.Any(x => x === value.State);
            var allowedCreateState = AllowedCreateStateValues.Any(x => x === value.State); --}}
            if(allowedCreateState && ) {

            }
        }