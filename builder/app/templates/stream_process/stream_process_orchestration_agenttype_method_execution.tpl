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
            throw NotImplementedException();
    }