
        public async Task Update({{model}}ChangeBy{{agent_type}} change) {
            try 
            {  
                var agent = await {{agent_type#lower}}Arbiter.Get<{{agent_type}}>(change.AgentId);
                var data = change.Data;
                if(await validator.Validate(data, agent, change)) 
                {
                    var updateData = await {{agent_type#lower}}Executor.Update(data, agent, change);
                    var result = await {{model_output#lower}}Arbiter.Update(updateData);
{{ae_calls}}
                    await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.Update(change, result));
                }
                else {
                    await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.UpdateFailedOnValidation(change));
                }
            }
            catch(Exception e)
            {
                await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.UpdateFailedOnException(change, e));
            }
        }
