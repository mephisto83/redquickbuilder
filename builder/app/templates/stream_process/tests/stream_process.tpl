
        [TestMethod]
        public async Task {{agent_type}}{{model}}Test()
        {
            //Arrange
            var response = Guid.NewGuid().ToString();
            var agent = {{agent_type}}.Create();
            var change = {{model}}ChangeBy{{agent_type}}.Create(agent, {{model}}.Create(), "func");
            change.Response = response;

            RedStrapper.Clear();
            RedStrapper.Add(builder =>
            {
                var streamProcessOrchestrationMock = new Mock<I{{agent_type}}StreamProcessOrchestration>();
                streamProcessOrchestrationMock.Setup(x => x.ProcessStagedChanges(It.IsAny<Distribution>())).Returns(() =>
                {
                    var stagedResponseArbiter = RedStrapper.Resolve<IRedArbiter<{{agent_type}}Response>>();
                    stagedResponseArbiter.Create({{agent_type}}Response.Create(change, agent)).GetAwaiter().GetResult();
                    return Task.CompletedTask;
                });
                builder.RegisterInstance(streamProcessOrchestrationMock.Object);
            });

            //Act 
            var res = await StreamProcess.{{model}}_{{agent_type}}(change);

            //Assert
            Assert.IsNotNull(res);
            Assert.IsNotNull(res.Id, change.Response);
        }
