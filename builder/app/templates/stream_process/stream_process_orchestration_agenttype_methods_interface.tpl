            
        Task<DistributionReport> Process{{model}}Changes (Distribution distribution = null);


        Task ProcessSelectedStagedChanges(IList<{{model}}Change> changes);
        
        
        Task Create({{model}}Change change);
        
        Task Update({{model}}Change change);

        Task Delete({{model}}Change change);