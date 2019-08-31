        public async Task<bool> Validate({{parameters}}) {
            var result = false;
            switch({{switch_parameter}})
            {
{{conditions}}
            }
            return result;
        }