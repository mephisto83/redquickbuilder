/// Can execute {{function.codeName}} if the {{agentType}} {{agent}}'s {{agent_determining_property}} is not in the list
public async Task<bool> Can{{function.codeName}}({{agentType}} {{agent}}, {{resourceType}} {{resource}}) {
    if(!{{resource}}.{{determining_property}}.Contains({{agent}}.{{agent_determining_property}})) {
        return true;
    }

    return false;
}