        [TestMethod]
        public async Task {{test_name}} ()
        {
            //Arrange 
            var attribute = new {{attribute_type}}({{attribute_parameters}});
            var model = new {{model}}();
{{set_properties}}

            //Act
            var result = await attribute.IsOk(model);

            //Assert
            Assert.AreEqual(result, {{expected_value}});
        }
