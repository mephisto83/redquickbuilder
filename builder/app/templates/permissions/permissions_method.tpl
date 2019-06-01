public Task<bool> Can{{method}}{{model}}({{agent_type}} {{agent}}, {{model}} {{value}}) {
    if(value == null) {
        return false;
    }
    if(agent == null){
        return false;
    }

    var allowedCreateState = AllowedCreateStateValues.Contains(value.State);
    if(allowedCreateState && ) {

    }
}