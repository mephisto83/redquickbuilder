
        public async Task {{test_name}} ()
        {
            //Arrange 
            var attribute = new {{attribute_type}}({{attribute_parameters}});
            var item = new {{model}}();
{{set_properties}}

            //Act
            var result = await attribute.IsOk(item);

            //Assert
            Assert.AreEqual(result, {{expected_value}});
        }
