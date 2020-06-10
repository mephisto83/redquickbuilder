        public async Task<{{model}}> {{function_name}}({{user}} user, {{model}} value) {

            var _user = await arbiter{{user}}.Get<{{user}}>(user.Id);

            if(await {{user#lower}}Permissions.{{permission_function}}(value, _user).ConfigureAwait(false)) {

                var parameters = {{model}}ChangeBy{{user}}.Create(_user, value, FunctionName.{{default_executor_function_name}});

                var result = await StreamProcess.{{model}}_{{user}}(parameters);

                return await arbiter{{model}}.Get<{{model}}>(result.IdValue);
            }
            throw new PermissionException();
        }
