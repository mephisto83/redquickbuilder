
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