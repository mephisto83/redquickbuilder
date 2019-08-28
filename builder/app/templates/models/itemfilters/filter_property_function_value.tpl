        public static Func<{{model_output}}, bool> Filter({{parameters}})
        {
            Func<{{model_output}}, bool> result = ({{meta_parameter}}) => {
                var res = true;

{{filter}}
                return res;
            };

            return result;
        }