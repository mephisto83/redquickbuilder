
        [TestMethod]
        public async Task {{function_name}}Test()
        {
            //Arrange
            var agentArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}>>();
            var modelArbiter = RedStrapper.Resolve<IRedArbiter<{{model}}>>();
            RedStrapper.Add(builder =>
            {
                builder.RegisterType<StreamProcessOrchestration>().As<IStreamProcessOrchestration>();
                builder.RegisterType<{{agent_type}}Executor>().As<I{{agent_type}}Executor>();
            });
            var agent = {{agent_type}}.Create();
{{set_agent_propeties}}
            agent = await agentArbiter.Create(agent);

            var item = {{model}}.Create();
{{set_model_properties}}

            var orchestration = RedStrapper.Resolve<IStreamProcessOrchestration>();
            var change = {{model}}Change.Create();
            change.Data = item;
            change.AgentId = agent.Id;
            change.FunctionName = FunctionName.{{function_name}};

            var responseArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}Response>>();
            change.Response = Guid.NewGuid().ToString();

            //Act
            await orchestration.Create(change);

            //Assert
            var response = (await responseArbiter.GetBy(x => x.Response == change.Response)).Single();
            Assert.IsNotNull(response);
            Assert.IsFalse(response.Failed);
            Assert.IsNotNull(response.IdValue);
            var new{{model}} = await modelArbiter.Get<{{model}}>(response.IdValue);
            Assert.IsNotNull(new{{model}});
            Assert.AreEqual(new{{model}}.{{agent_type}}, agent.Id);
        }


        [TestMethod]
        public async Task {{function_name}}Test_Failed()
        {
            //Arrange
            RedStrapper.Add(builder =>
            {
                builder.RegisterType<StreamProcessOrchestration>().As<IStreamProcessOrchestration>();
            });
            var orchestration = RedStrapper.Resolve<IStreamProcessOrchestration>();
            var change = {{model}}Change.Create();
            var responseArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}Response>>();
            change.Response = Guid.NewGuid().ToString();

            //Act
            await orchestration.Create(change);

            //Assert
            var response = (await responseArbiter.GetBy(x => x.Response == change.Response)).Single();
            Assert.IsNotNull(response);
        }