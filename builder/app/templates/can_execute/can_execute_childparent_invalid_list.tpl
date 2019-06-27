/// Can execute {{function_name}} if the {{agentType}} {{agent}}'s {{agent_determining_property}} is not in the list
public async Task<bool> Can{{function_name}}({{agentType}} {{agent}}, {{resourceType}} {{resource}}) {
    if(!{{resource}}.{{determining_property}}.Contains({{agent}}.{{agent_determining_property}})) {
        return true;
    }

    return false;
}