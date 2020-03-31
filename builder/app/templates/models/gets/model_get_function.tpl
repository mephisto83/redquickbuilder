        public static Func<{{model}}, bool> Get{{model}}({{agent_type}} agent)
        {
            Func<{{model}}, bool> result = (item) => item!= null && agent != null && agent.{{model}} != null && agent.{{model}}.Any(v => v == item.Id );
            return result;
        }
