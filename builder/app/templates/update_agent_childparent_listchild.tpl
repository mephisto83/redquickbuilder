        public async Task<IList<{{model}}>> {{function.codeName}}({{user}} user, {{model}} value) 
        {

            var {{agent#lower}} = await {{agent_type#lower}}Arbiter.GetOwnedBy<{{agent_type}}>(user.{{agent_type}});
            if(await {{can.function.codeName}}({{agent#lower}}, value).ConfigureAwait(false))) {
                var {{model#lower}}Change = {{model}}Parameters.Update({{agent#lower}}, value);
                var {{model#lower}}Change = {{model#lower}}Change.Create({{model}}Change);
                await StreamProcess.{{model}}({{model}}Change);

                return await {{model#lower}}Arbiter.GetBy<{{model}}>(x => x.{{determining_property}} == value.{{parentIdProperty}});
            }
            return new List<{{model}}>();
        }