            
        public async Task<DistributionReport> Process{{model}}ChangesBy{{agent_type}} (Distribution distribution = null)
        {
            DistributionReport result = null;
            IList<{{model}}ChangeBy{{agent_type}}> changes = null;
            if (Distribution.Ok(distribution))
            {
                Expression<Func<{{model}}ChangeBy{{agent_type}}, bool>> funct = (c) => (c.StreamType == distribution.Stream);
                changes = (await {{model#lower}}ChangeBy{{agent_type}}Arbiter.Query(distribution.RedExpression<{{model}}ChangeBy{{agent_type}}>().And(funct))).ToList();
            }
            else
            {
                changes = await {{model#lower}}ChangeBy{{agent_type}}Arbiter.GetAll<{{model}}ChangeBy{{agent_type}}>();
            }

            result = DistributionReport.Create(changes);
            await ProcessSelectedStagedChangesBy{{agent_type}}(changes);
            return result;
        
        }

        public async Task ProcessSelectedStagedChangesBy{{agent_type}}(IList<{{model}}ChangeBy{{agent_type}}> changes)
        {
            foreach (var change in changes)
            {
                try
                {
                    await {{model#lower}}ChangeBy{{agent_type}}Arbiter.Delete(change.Id);
                }
                catch (Exception e) { }
            }
            foreach (var change in changes)
            {
                try
                {
                    switch (change.ChangeType)
                    {
                        case Methods.Create:
                            await Create(change);
                            break;
                        case Methods.Update:
                            await Update(change);
                            break;
                        case Methods.Delete:
                            await Delete(change);
                            break;
                        default:
                            throw new NotImplementedException();
                    }
                }
                catch (Exception e)
                {
                }
            }
        }
        
        
        public async Task Create({{model}}ChangeBy{{agent_type}} change) {
            try 
            {
                var agent = await {{agent_type#lower}}Arbiter.Get<{{agent_type}}>(change.AgentId);
                var data = change.Data;
            
                if(await validator.Validate<{{model}}, {{agent_type}}, {{model}}ChangeBy{{agent_type}}>(data, agent, change)) 
                {
                    data = await {{agent_type#lower}}Executor.Create(data, agent, change);
                    var result = await {{model#lower}}Arbiter.Create(data);
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

        public async Task Update({{model}}ChangeBy{{agent_type}} change) {
            try 
            {  
                var agent = await {{agent_type#lower}}Arbiter.Get<{{agent_type}}>(change.AgentId);
                var data = change.Data;
                if(await validator.Validate<{{model}}, {{agent_type}}, {{model}}ChangeBy{{agent_type}}>(data, agent, change)) 
                {
                    data = await {{agent_type#lower}}Executor.Update(data, agent, change);
                    var result = await {{model#lower}}Arbiter.Update(data);
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

        public async Task Delete({{model}}ChangeBy{{agent_type}} change) {
            try
            {
                var agent = await {{agent_type#lower}}Arbiter.Get<{{agent_type}}>(change.AgentId);
                var data = change.Data;
            
                if(await validator.Validate<{{model}}, {{agent_type}}, {{model}}ChangeBy{{agent_type}}>(data, agent, change)) 
                {
                    var result = await {{model#lower}}Arbiter.Delete(data);
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