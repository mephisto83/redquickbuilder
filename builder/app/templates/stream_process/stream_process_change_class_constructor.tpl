// Per {{method}}
public {{model}}Change {{method}}({{model}} {{value}}, {{agent_type}} {{agent}}) {
 
    var result = new {{model}}Change();
    result.AgentType = {{agent}}.GetType().FullName;
    result.AgentId = {{agent}}.Id;
    result.Data = {{value}};
    
    return result;
}