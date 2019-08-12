            
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
                        {{create_call}}
                        {{update_call}}
                        default:
                            throw new NotImplementedException();
                    }
                }
                catch (Exception e)
                {
                }
            }
        }
        
{{create_method}}
{{update_method}}
{{delete_method}}
{{ae_functions}}