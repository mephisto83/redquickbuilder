
        private async Task {{function_name}}({{agent}} agent, {{composite-input}} data, {{model}} result)
        {
            foreach (var i in data.{{composite-input-property}})
            {
                var d = {{many_to_many}}.Create();
                d.{{agent}} = i;
                d.{{model}} = result.Id;
                d = await {{many_to_many#lower}}Arbiter.Create(d);
            }
        }