
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
            //Set Agent Properties
{{set_agent_properties}}

            var model = {{model}}.Create();
            //Set Model Properties
{{set_model_properties}}

            //Act
            var res = await permission.{{function_name}}(agent, model);

            //Assert
            Assert.AreEqual(res, {{result}});

        }
