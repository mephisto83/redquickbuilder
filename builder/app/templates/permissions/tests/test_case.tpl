
        [TestMethod]
        public async Task TestPermissions{{test}}()
        {
            //Arrange
            RedStrapper.Add(builder =>
            {
                builder.RegisterType<Permissions{{agent_type}}>().As<IPermissions{{agent_type}}>();
            });
            var permission = RedStrapper.Resolve<IPermissions{{agent_type}}>();
            var agent = {{agent_type}}.Create();
            var item = {{model}}.Create();

            //Act
            var res = await permission.Can{{method}}{{model}}(agent, item);

            //Assert
            Assert.AreEqual(res, {{result}});

        }
