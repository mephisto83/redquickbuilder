
        public async Task Create({{model}}ChangeBy{{agent_type}} change) {
            try 
            {
                var agent = await {{agent_type#lower}}Arbiter.Get<{{agent_type}}>(change.AgentId);
                var data = change.Data;
            
                if(await validator.Validate(data, agent, change)) 
                {
                    var newData = await {{agent_type#lower}}Executor.Create(data, agent, change);
                    var result = await {{model_output#lower}}Arbiter.Create(newData);
{{ae_calls}}
                    await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.Create(change, result));
                }
                else {
                    await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.CreateFailedOnValidation(change));
                }
            }
            catch(Exception e)
            {
                await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.CreateFailedOnException(change, e));
            }
        }