
        public async Task Delete({{model}}ChangeBy{{agent_type}} change) {
            try
            {
                var agent = await {{agent_type#lower}}Arbiter.Get<{{agent_type}}>(change.AgentId);
                var data = change.Data;
            
                if(await validator.Validate<{{model}}, {{agent_type}}, {{model}}ChangeBy{{agent_type}}>(data, agent, change)) 
                {
                    var result = await {{model#lower}}Arbiter.Delete(data);
{{ae_calls}}
                    await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.Delete(change, result));
                }
                else {
                    await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.DeleteFailedOnValidation(change));
                }
            }
            catch(Exception e)
            {
                await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.DeleteFailedOnException(change, e));
            }
            
        }