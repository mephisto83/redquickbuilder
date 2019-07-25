
        [TestMethod]
        public async Task {{testname}}()
        {
            //Arrange
            await RedStorage.Clear();
            RedConfiguration.WaitTime = 1;
            RedStrapper.Clear();
            RedStrapper.Add(builder =>
            {
                builder.RegisterType<Permissions{{agent}}>().As<IPermissions{{agent}}>();
                builder.RegisterType<{{maestro}}>().As<I{{maestro}}>();
                builder.RegisterType<StreamProcessOrchestration>().As<IStreamProcessOrchestration>();
                builder.RegisterType<StreamProcessOrchestration>().As<IRedStreamProcessOrchestration>();
                builder.RegisterType<{{agent}}Executor>().As<I{{agent}}Executor>();
                var streams = Helper.GetConstantValues<StreamType>().ToList();
                var mockIStreamTypeService = new Mock<IStreamTypeService>();
                mockIStreamTypeService.Setup(x => x.GetStreamTypes()).Returns(streams);
                var mockIWorkTaskService = new Mock<IWorkTaskService>();
                mockIWorkTaskService.Setup(x => x.GetWorkTasks()).Returns(new List<string> { "worktask1" });
                var mockIHubHelperService = new Mock<IHubHelperService>();
                mockIHubHelperService.Setup(x => x.GetEventHubNames()).ReturnsAsync(new List<string> { "hub2" });
                var hubHelperMock = new Mock<IHubHelper>();
                var redHost = RedMemoryHost.Create();
                builder.RegisterInstance(redHost).As<IRedHost>();
                builder.RegisterInstance(redHost).As<IRedEventHubClient>();
                builder.RegisterInstance(mockIWorkTaskService.Object);
                builder.RegisterInstance(mockIHubHelperService.Object);
                builder.RegisterInstance(mockIStreamTypeService.Object);
            });
            var Id = Guid.NewGuid().ToString();
            var hubHelper = RedStrapper.Resolve<IHubHelper>();
            var hubName = await hubHelper.GetHubName(Id);

            var host = RedStrapper.Resolve<IRedHost>();
            await host.RunAsync(hubName);


            var userArbiter = RedStrapper.Resolve<IRedArbiter<{{user}}>>();
            var agentArbiter = RedStrapper.Resolve<IRedArbiter<{{agent}}>>();
            var modelArbiter = RedStrapper.Resolve<IRedArbiter<{{model}}>>();

            var maestro = RedStrapper.Resolve<I{{maestro}}>();
            var user = {{user}}.Create();
            user = await userArbiter.Create(user);

            var agent = {{agent}}.Create();
{{set_agent_properties}}
            agent = await agentArbiter.Create(agent);

            user.{{agent}} = agent.Id;
            user = await userArbiter.Update(user);

            var model = {{model}}.Create();
{{set_model_properties}}

            var workerMinisterArbiter = RedStrapper.Resolve<IWorkMinister>();
            await workerMinisterArbiter.ApplyWorkToAllWorkers();

            //Act
            try 
            {
                
                var list = await maestro.{{function_name}}(user, model);
    
                //Assert
                Assert.IsNotNull(list);

            }
            catch(ValidationException validationException)
            {
                Assert.IsNotNull(validationException.Response);
                Assert.IsNotNull(validationException.Response.AgentId);
                Assert.IsNotNull(validationException.Response.AgentType);
                Assert.IsTrue(validationException.Response.ValidationFailure);
                Assert.IsFalse(validationException.Response.ExceptionRaised);
            }
            catch(ThrownException thrownException)
            {
                Assert.IsNotNull(thrownException.Response);
                Assert.IsNotNull(thrownException.Response.AgentId);
                Assert.IsNotNull(thrownException.Response.AgentType);
                Assert.IsFalse(thrownException.Response.ValidationFailure);
                Assert.IsTrue(thrownException.Response.ExceptionRaised);
            }
            catch(PermissionException permissionException)
            {
                Assert.IsNotNull(permissionException);
            }
            finally
            {
                await host.Stop(hubName);
            }
        }