        [TestMethod]
        public async Task {{test_name}}()
        {
            //Arrange
            var newitem = {{model}}.Create();

            RedStrapper.Add(builder =>
            {
                var validatorMock = new Mock<I{{agent}}Validations>();
                validatorMock.Setup(x => x.Validate(It.IsAny<{{model}}>(), It.IsAny<{{agent_type}}>(), It.IsAny<{{model}}ChangeBy{{agent_type}}>()))
                    .Returns(Task.FromResult(true));

                var executorMock = new Mock<I{{agent_type}}Executor>();
                executorMock.Setup(x => x.Create(It.IsAny<{{model}}>(), It.IsAny<{{agent_type}}>(), It.IsAny<{{model}}ChangeBy{{agent_type}}>()))
                    .Returns(Task.FromResult(newitem));
{{stream_process_orchestration_mocks}}                    
                builder.RegisterType<StreamProcessOrchestration>().As<IStreamProcessOrchestration>();
                builder.RegisterInstance(validatorMock.Object);
                builder.RegisterInstance(executorMock.Object);
            });
            var agentArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}>>();
            var agent = {{agent_type}}.Create();
            agent = await agentArbiter.Create(agent);

            var model = {{model}}.Create();
            var parameterArbiter = RedStrapper.Resolve<IRedArbiter<{{model}}ChangeBy{{agent_type}}>>();
            var parameters = {{model}}ChangeBy{{agent_type}}.Create(agent, model, FunctionName.{{function_name}});
            parameters.Response = Guid.NewGuid().ToString();
            await parameterArbiter.Create(parameters);

            var responseArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}Response>>();

            var orchestration = RedStrapper.Resolve<I{{agent_type}}StreamProcessOrchestration>();

            //Act
            var stageChangedOutput = await orchestration.ProcessStagedChanges();
            var response = (await responseArbiter.GetBy(e => e.Response == parameters.Response)).Single();

            //Assert
            Assert.IsNotNull(response);
            Assert.IsNotNull(response.IdValue);
        }

        [TestMethod]
        public async Task {{test_name}}_Invalid()
        {
            //Arrange
            var newitem = {{model}}.Create();

            RedStrapper.Add(builder =>
            {
                var validatorMock = new Mock<I{{agent}}Validations>();
                validatorMock.Setup(x => x.Validate(It.IsAny<{{model}}>(), It.IsAny<{{agent_type}}>(), It.IsAny<{{model}}ChangeBy{{agent_type}}>()))
                    .Returns(Task.FromResult(false));

                var executorMock = new Mock<I{{agent_type}}Executor>();
                executorMock.Setup(x => x.Create(It.IsAny<{{model}}>(), It.IsAny<{{agent_type}}>(), It.IsAny<{{model}}ChangeBy{{agent_type}}>()))
                    .Returns(Task.FromResult(newitem));
{{stream_process_orchestration_mocks}}                   
                builder.RegisterType<StreamProcessOrchestration>().As<IStreamProcessOrchestration>();
                builder.RegisterInstance(validatorMock.Object);
                builder.RegisterInstance(executorMock.Object);
            });
            var agentArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}>>();
            var agent = {{agent_type}}.Create();
            agent = await agentArbiter.Create(agent);

            var model = {{model}}.Create();
            var parameterArbiter = RedStrapper.Resolve<IRedArbiter<{{model}}ChangeBy{{agent_type}}>>();
            var parameters = {{model}}ChangeBy{{agent_type}}.Create(agent, model, FunctionName.{{function_name}});
            parameters.Response = Guid.NewGuid().ToString();
            await parameterArbiter.Create(parameters);

            var responseArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}Response>>();

            var orchestration = RedStrapper.Resolve<IStreamProcessOrchestration>();

            //Act
            var stageChangedOutput = await orchestration.ProcessStagedChanges();
            var response = (await responseArbiter.GetBy(e => e.Response == parameters.Response)).Single();

            //Assert
            Assert.IsNotNull(response);
            Assert.IsNull(response.IdValue);
            Assert.IsTrue(response.Failed);
        }

  

        [TestMethod]
        public async Task {{test_name}}_ThrowsException()
        {
            //Arrange
            var newitem = {{model}}.Create();

            RedStrapper.Add(builder =>
            {
                var validatorMock = new Mock<I{{agent}}Validations>();
                validatorMock.Setup(x => x.Validate(It.IsAny<{{model}}>(), It.IsAny<{{agent_type}}>(), It.IsAny<{{model}}ChangeBy{{agent_type}}>()))
                    .Throws(new Exception());

                var executorMock = new Mock<I{{agent_type}}Executor>();
                executorMock.Setup(x => x.Create(It.IsAny<{{model}}>(), It.IsAny<{{agent_type}}>(), It.IsAny<{{model}}ChangeBy{{agent_type}}>()))
                    .Returns(Task.FromResult(newitem));
{{stream_process_orchestration_mocks}}                   
                builder.RegisterType<StreamProcessOrchestration>().As<IStreamProcessOrchestration>();
                builder.RegisterInstance(validatorMock.Object);
                builder.RegisterInstance(executorMock.Object);
            });
            var agentArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}>>();
            var agent = {{agent_type}}.Create();
            agent = await agentArbiter.Create(agent);

            var model = {{model}}.Create();
            var parameterArbiter = RedStrapper.Resolve<IRedArbiter<{{model}}ChangeBy{{agent_type}}>>();
            var parameters = {{model}}ChangeBy{{agent_type}}.Create(agent, model, FunctionName.{{function_name}});
            parameters.Response = Guid.NewGuid().ToString();
            await parameterArbiter.Create(parameters);

            var responseArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}Response>>();

            var orchestration = RedStrapper.Resolve<IStreamProcessOrchestration>();

            //Act
            var stageChangedOutput = await orchestration.ProcessStagedChanges();
            var response = (await responseArbiter.GetBy(e => e.Response == parameters.Response)).Single();

            //Assert
            Assert.IsNotNull(response);
            Assert.IsNull(response.IdValue);
            Assert.IsTrue(response.Failed);
        }
  
  