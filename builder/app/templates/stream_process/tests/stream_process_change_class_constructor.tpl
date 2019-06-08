
        [TestMethod]
        public async Task {{method}}{{agent_type}}{{model}}()
        {
            // Arrange
            var agent = {{agent_type}}.Create();
            agent.Id = Guid.NewGuid().ToString();
            var changeType = Methods.{{method}};
            var value = {{model}}.Create();

            // Act
            var res = {{model}}Change.{{method}}(agent, value);

            //Assert
            Assert.AreEqual(agent.Id, res.AgentId);
            Assert.AreEqual(changeType, res.ChangeType);
            Assert.AreEqual(res.Data, value);
        }
