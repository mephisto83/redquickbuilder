        public static Func<{{model}}, bool> Get{{model}}({{agent_type}} agent)
        {
            Func<{{model}}, bool> result = (item) => item.{{agent_type}} == agent.Id;
            return result;
        }