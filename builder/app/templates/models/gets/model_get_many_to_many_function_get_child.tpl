
        public static Func<{{model}}, bool> Get{{model}}(IList<{{many_to_many}}> list)
        {
            var ids = list.Select(x => x.{{model}}).ToList();
            Func<{{model}}, bool> result = (item) => ids.Any(t => t == item.Id);
            return result;
        }
