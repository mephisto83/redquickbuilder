
        public static IList<{{model}}> {{function}}(IList<{{model}}> models, {{agent}} agent)
        {
            return models.Select({{function}}(agent)).ToList();
        }

        public static Func<{{model}}, {{model}}> {{function}}({{agent}} agent)
        {
            Func<{{model}}, {{model}}> result = model => {{function}}(model, agent);

            return result;
        }

        public static {{model}} {{function}}({{model}} model, {{agent}} agent)
        {
            var result = {{model}}.Create();
            result.Id = model.Id;
{{set_properties}}

            return result;
        }