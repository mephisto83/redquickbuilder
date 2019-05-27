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
                    {{agent_method_executions}}
                }
               
            }
            catch (Exception e)
            {
            }
        }
    }
{{agent_type_methods}}    
}