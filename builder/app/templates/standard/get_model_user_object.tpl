        //Get {{model}} by {{user}}.Id.
        public async Task<{{model}}> {{function_name}}({{user}} user) {

            var model =  await arbiter{{model}}.Get<{{model}}>(user.Id);
            return {{agent_type}}Return.{{filter_function}}(model, user);
        }
