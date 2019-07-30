
        [TestMethod]
        public async Task TestPermissions{{test}}()
        {
            //Arrange
            RedStrapper.Add(builder =>
            {
                builder.RegisterType<Permissions{{agent_type}}>().As<IPermissions{{agent_type}}>();
            });
            var permission = RedStrapper.Resolve<IPermissions{{agent_type}}>();
{{many_to_many_constructor}}
            var agent = {{agent_type}}.Create();
            //Set Agent Properties
{{set_agent_properties}}
{{parent_setup}}
            var model = {{model}}.Create();
            //Set Model Properties
{{set_model_properties}}

            //Many to many connection.
{{many_to_many_register}}

            //setup cases
{{setup_cases}}

            //Act
            var res = await permission.{{function_name}}(agent, model);

            //Assert
            Assert.AreEqual(res, {{result}});

        }
