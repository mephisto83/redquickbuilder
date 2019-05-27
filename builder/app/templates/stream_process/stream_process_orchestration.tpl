public class {{model}}StagedChangesOrchestration : IStagedChangesOrchestration<{{model}}Change>
{
    {{arbiter_instances}}
    public StagedChangesOrchestration()
    {
        {{arbiters_strappers}}
    }


    public async Task<DistributionReport> ProcessStagedChanges(Distribution distribution = null)
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

    public async Task ProcessSelectedStagedChanges(IList<string> changes)
    {

        var _changes = await stagedChangedArbiter.GetBy(x => changes.Contains(x.Id));
        await ProcessSelectedStagedChanges(_changes);
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
                switch(change.AgentType) {
                    case AgentTypes.{{agent_type}}:
                        switch (change.ChangeType)
                        {
                            case {{model}}Change.CREATE:
                                await {{agent_type}}Create(change);
                                break;
                            case {{model}}Change.UPDATE:
                                await {{agent_type}}Update(change);
                                break;
                            case {{model}}Change.DELETE:
                                await {{agent_type}}Delete(change);
                                break;
                            default:
                                throw NotImplementedException();
                        }
                        break;
                }
               
            }
            catch (Exception e)
            {
            }
        }
    }
    public async Task Create({{model}}Change change) {
        {{agent_type}} agent = await {{agent_type}}Arbiter.Get(change.AgentId);
        {{model}} data = change.Data;
        if(await validator.Validate<{{model}}, {{agent_type}}>(data, agent, MethodType.CREATE)) {
            var result = await {{model}}Arbiter.Create(data);
        }
        else {
            await {{model}}ResponseArbiter.Create({{model}}Response.CreateFailed(change));
        }
    }
}