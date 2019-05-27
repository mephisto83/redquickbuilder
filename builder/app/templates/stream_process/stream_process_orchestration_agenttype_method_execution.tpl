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