        public static Func<{{model}}, bool> Get{{model}}({{agent_type}} agent)
        {
            Func<{{model}}, bool> result = (item) => item.{{item_property}} == agent.Id;
            return result;
        }