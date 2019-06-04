        public async Task<bool> Can{{method}}{{model}}({{agent_type}} {{agent}}, {{model}} {{value}}) {
            if({{value}} == null) {
                return false;
            }
            if({{agent}} == null){
                return false;
            }
            var result = false;

{{cases}}
{{case_result}}
            return result;
        }