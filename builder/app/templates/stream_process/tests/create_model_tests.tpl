
        [TestMethod]
        public async Task {{test_name}}Test()
        {
            //Arrange 
            RedStrapper.Clear();
            
            var agentArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}>>();
            var modelArbiter = RedStrapper.Resolve<IRedArbiter<{{model}}>>();
            RedStrapper.Add(builder =>
            {
                builder.RegisterType<{{agent_type}}StreamProcessOrchestration>().As<I{{agent_type}}StreamProcessOrchestration>();
                builder.RegisterType<StreamProcessOrchestration>().As<IStreamProcessOrchestration>();
                builder.RegisterType<{{agent_type}}Executor>().As<I{{agent_type}}Executor>();
            });
            var agent = {{agent_type}}.Create();
{{set_agent_propeties}}
            agent = await agentArbiter.Create(agent);

            var model = {{model}}.Create();
{{set_model_properties}}

            var orchestration = RedStrapper.Resolve<I{{agent_type}}StreamProcessOrchestration>();
            var change = {{model}}ChangeBy{{agent_type}}.Create();
            change.Data = model;
            change.AgentId = agent.Id;
            change.FunctionName = FunctionName.{{function_name}};

            var responseArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}Response>>();
            change.Response = Guid.NewGuid().ToString();

            //Act
            await orchestration.Create(change);

            //Assert
            var response = (await responseArbiter.GetBy(x => x.Response == change.Response)).Single();
            Assert.IsNotNull(response);
            Assert.AreEqual(response.Failed, {{test_result}});
            if(response.Failed)
            { 
                Assert.IsNull(response.IdValue);
            }
            else 
            {
                Assert.IsNotNull(response.IdValue);
                var new{{model}} = await modelArbiter.Get<{{model}}>(response.IdValue);
                Assert.IsNotNull(new{{model}});
                Assert.AreEqual(new{{model}}.{{agent_type}}, agent.Id);
            }
        }


        [TestMethod]
        public async Task {{test_name}}Test_Failed()
        {
            //Arrange
            RedStrapper.Clear();
            RedStrapper.Add(builder =>
            {
                builder.RegisterType<{{agent_type}}StreamProcessOrchestration>().As<I{{agent_type}}StreamProcessOrchestration>();
                builder.RegisterType<StreamProcessOrchestration>().As<IStreamProcessOrchestration>();
            });
            var orchestration = RedStrapper.Resolve<I{{agent_type}}StreamProcessOrchestration>();
            var change = {{model}}ChangeBy{{agent_type}}.Create();
            var responseArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}Response>>();
            change.Response = Guid.NewGuid().ToString();

            //Act
            await orchestration.Create(change);

            //Assert
            var response = (await responseArbiter.GetBy(x => x.Response == change.Response)).Single();
            Assert.IsNotNull(response);
        }