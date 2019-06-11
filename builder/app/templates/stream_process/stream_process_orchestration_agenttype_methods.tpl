            
        public async Task<DistributionReport> Process{{model}}Changes (Distribution distribution = null)
        {
            DistributionReport result = null;
            IList<{{model}}Change> changes = null;
            if (Distribution.Ok(distribution))
            {
                Expression<Func<{{model}}Change, bool>> funct = (c) => (c.StreamType == distribution.Stream);
                changes = (await {{model#lower}}ChangeArbiter.Query(distribution.RedExpression<{{model}}Change>().And(funct))).ToList();
            }
            else
            {
                changes = await {{model#lower}}ChangeArbiter.GetAll<{{model}}Change>();
            }

            result = DistributionReport.Create(changes);
            await ProcessSelectedStagedChanges(changes);
            return result;
        
        }

        public async Task ProcessSelectedStagedChanges(IList<{{model}}Change> changes)
        {
            foreach (var change in changes)
            {
                try
                {
                    await {{model#lower}}ChangeArbiter.Delete(change.Id);
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
        
        
        public async Task Create({{model}}Change change) {
            var agent = await {{agent_type#lower}}Arbiter.Get<{{agent_type}}>(change.AgentId);
            var data = change.Data;
            if(await validator.Validate<{{model}}, {{agent_type}}, {{model}}Change>(data, agent, change)) 
            {
                data = await {{agent_type}}Executor.Create(data, agent, change);
                var result = await {{model#lower}}Arbiter.Create(data);
                await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.Create(change, result));
            }
            else {
                await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.CreateFailed(change));
            }
        }

        public async Task Update({{model}}Change change) {
            var agent = await {{agent_type#lower}}Arbiter.Get<{{agent_type}}>(change.AgentId);
            var data = change.Data;
            if(await validator.Validate<{{model}}, {{agent_type}}, {{model}}Change>(data, agent, change)) 
            {
                data = await {{agent_type}}Executor.Update(data, agent, change);
                var result = await {{model#lower}}Arbiter.Update(data);
                await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.Update(change, result));
            }
            else {
                await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.UpdateFailed(change));
            }
        }

        public async Task Delete({{model}}Change change) {
            var agent = await {{agent_type#lower}}Arbiter.Get<{{agent_type}}>(change.AgentId);
            var data = change.Data;
            if(await validator.Validate<{{model}}, {{agent_type}}, {{model}}Change>(data, agent, change)) 
            {
                var result = await {{model#lower}}Arbiter.Delete(data);
                await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.Delete(change, result));
            }
            else {
                await {{agent_type#lower}}ResponseArbiter.Create({{agent_type}}Response.DeleteFailed(change));
            }
        }