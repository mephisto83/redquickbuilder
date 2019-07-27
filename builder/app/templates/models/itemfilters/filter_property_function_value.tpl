        public static Func<{{model}}, bool> Filter({{parameters}})
        {
            Func<{{model}}, bool> result = (item) => {
                var res = true;

{{filter}}
                return res;
            };

            return result;
        }