
    public async Task<DistributionReport> Process{{model}}Changes (Distribution distribution = null)
    {
        DistributionReport result = null;
        IList<{{model}}Change> changes = null;
        if (Distribution.Ok(distribution))
        {
            Expression<Func<{{model}}Change, bool>> funct = (c) => (c.StreamType == distribution.Stream);
            changes = (await stagedChangedArbiter.Query(distribution.RedExpression<{{model}}Change>().And(funct))).ToList();
        }
        else
        {
            changes = await stagedChangedArbiter.GetAll<{{model}}Change>();
        }

        result = DistributionReport.Create(changes);
        await ProcessSelectedStagedChanges(changes);
        return result;
    
    }

    async Task ProcessSelectedStagedChanges(IList<{{model}}Change> changes)
    {
        foreach (var change in changes)
        {
            try
            {
                await stagedChangedArbiter.Delete(change.Id);
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