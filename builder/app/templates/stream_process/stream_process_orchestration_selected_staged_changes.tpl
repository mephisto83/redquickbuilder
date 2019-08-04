
    public async Task<DistributionReport> Process{{model}}Changes (Distribution distribution = null)
    {
        DistributionReport result = null;
        IList<{{model}}ChangeBy{{agent_type}}> changes = null;
        if (Distribution.Ok(distribution))
        {
            Expression<Func<{{model}}ChangeBy{{agent_type}}, bool>> funct = (c) => (c.StreamType == distribution.Stream);
            changes = (await {{model#lower}}ChangeArbiter.Query(distribution.RedExpression<{{model}}ChangeBy{{agent_type}}>().And(funct))).ToList();
        }
        else
        {
            changes = await {{model#lower}}ChangeBy{{agent_type}}Arbiter.GetAll<{{model}}ChangeBy{{agent_type}}>();
        }

        result = DistributionReport.Create(changes);
        await ProcessSelectedStagedChanges(changes);
        return result;
    
    }

    public async Task ProcessSelectedStagedChanges(IList<{{model}}ChangeBy{{agent_type}}> changes)
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