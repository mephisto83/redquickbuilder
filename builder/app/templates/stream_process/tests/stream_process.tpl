
        [TestMethod]
        public async Task {{agent_type}}{{model}}Test()
        {
            //Arrange
            var response = Guid.NewGuid().ToString();
            var agent = {{agent_type}}.Create();
            var change = {{model}}Change.Create(agent, {{model}}.Create());
            change.Response = response;

            RedStrapper.Clear();
            RedStrapper.Add(builder =>
            {
                var streamProcessOrchestrationMock = new Mock<IStreamProcessOrchestration>();
                streamProcessOrchestrationMock.Setup(x => x.ProcessStagedChanges()).Returns(() =>
                {
                    var stagedResponseArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}Response>>();
                    stagedResponseArbiter.Create({{agent_type}}Response.Create(change, agent)).GetAwaiter().GetResult();
                    return Task.CompletedTask;
                });
                builder.RegisterInstance(streamProcessOrchestrationMock.Object);
            });

            //Act 
            var res = await StreamProcess.{{model}}<{{agent_type}}>(change);

            //Assert
            Assert.IsNotNull(res);
        }
