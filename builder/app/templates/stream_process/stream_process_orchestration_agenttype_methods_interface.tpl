            
        Task<DistributionReport> Process{{model}}ChangesBy{{agent_type}} (Distribution distribution = null);


        Task ProcessSelectedStagedChangesBy{{agent_type}} (IList<{{model}}ChangeBy{{agent_type}}> changes);
        
        
        Task Create({{model}}ChangeBy{{agent_type}} change);
        
        Task Update({{model}}ChangeBy{{agent_type}} change);

        Task Delete({{model}}ChangeBy{{agent_type}} change);