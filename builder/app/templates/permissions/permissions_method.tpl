        public async Task<bool> {{function_name}}({{agent_type}} {{agent}}, {{model}} {{value}}) {
            if({{value}} == null) {
                return false;
            }
            if({{agent}} == null){
                return false;
            }
            var result = false;
            {{parent_setup}}
{{cases}}
{{case_result}}
            return result;
        }