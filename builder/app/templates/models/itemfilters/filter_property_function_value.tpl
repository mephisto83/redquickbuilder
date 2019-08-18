        public static Func<{{model_output}}, bool> Filter({{parameters}})
        {
            Func<{{model_output}}, bool> result = (item) => {
                var res = true;

{{filter}}
                return res;
            };

            return result;
        }