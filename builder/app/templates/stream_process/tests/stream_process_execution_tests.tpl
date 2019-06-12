        [TestMethod]
        public async Task {{test_name}}()
        {
            //Arrange
            var newitem = {{model}}.Create();

            RedStrapper.Add(builder =>
            {
                var validatorMock = new Mock<IValidator>();
                validatorMock.Setup(x => x.Validate(It.IsAny<{{model}}>(), It.IsAny<{{agent_type}}>(), It.IsAny<{{model}}Change>()))
                    .Returns(Task.FromResult(true));

                var executorMock = new Mock<I{{agent_type}}Executor>();
                executorMock.Setup(x => x.Create(It.IsAny<{{model}}>(), It.IsAny<{{agent_type}}>(), It.IsAny<{{model}}Change>()))
                    .Returns(Task.FromResult(newitem));
                builder.RegisterType<StreamProcessOrchestration>().As<IStreamProcessOrchestration>();
                builder.RegisterInstance(validatorMock.Object);
                builder.RegisterInstance(executorMock.Object);
            });
            var agentArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}>>();
            var agent = {{agent_type}}.Create();
            agent = await agentArbiter.Create(agent);

            var model = {{model}}.Create();
            var parameterArbiter = RedStrapper.Resolve<IRedArbiter<{{model}}Change>>();
            var parameters = {{model}}Change.Create(agent, model, FunctionName.{{function_name}});
            parameters.Response = Guid.NewGuid().ToString();
            await parameterArbiter.Create(parameters);

            var responseArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}Response>>();

            var orchestration = RedStrapper.Resolve<IStreamProcessOrchestration>();

            //Act
            await orchestration.ProcessStagedChanges();
            var response = (await responseArbiter.GetBy(e => e.Response == parameters.Response)).Single();

            //Assert
            Assert.IsNotNull(response);
            Assert.IsNotNull(response.IdValue);
        }
  