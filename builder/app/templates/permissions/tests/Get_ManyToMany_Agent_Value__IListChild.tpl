
        [TestMethod]
        public async Task TestPermissions{{test}}()
        {
            //Arrange
            RedStrapper.Add(builder =>
            {
                builder.RegisterType<Permissions{{agent_type}}>().As<IPermissions{{agent_type}}>();
            });
            var agentArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}>>();
            var modelArbiter = RedStrapper.Resolve<IRedArbiter<{{model}}>>();
            var parentArbiter = RedStrapper.Resolve<IRedArbiter<{{parent}}>>();
            var manyToManyArbiter = RedStrapper.Resolve<IRedArbiter<{{many_to_many}}>>();
                
            var permission = RedStrapper.Resolve<IPermissions{{agent_type}}>();
            var agent = {{agent_type}}.Create();

            //Set Agent Properties
{{set_agent_properties}}
            agent = await agentArbiter.Create(agent);
            
            
            var parent = {{parent}}.Create();

            //Set Parent Properties
{{set_parent_properties}}
            parent = await parentArbiter.Create(parent);

{{set_match_reference_properties}}

            

            //Act
            var res = await permission.{{function_name}}(agent, parent);

            //Assert
            Assert.AreEqual(res, {{result}});

        }
