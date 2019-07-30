//Templated version.
public async Task<{{model}}> {{function_name}}({{user}} user, {{model}} value) { 

    var agent = await arbiter{{agent}}.Get<{{agent}}>(user.{{agent}});

    if(await {{agent#lower}}Permissions.{{permission_function}}(agent, value).ConfigureAwait(false)) {
        var parameters = {{model}}Change.Delete({{customer}}, value, FunctionName.{{function_name}});

        var result = await StreamProcess.{{model}}<{{agent}}>(parameters);

        return result.Value;
    }
    throw new PermissionException();
}
