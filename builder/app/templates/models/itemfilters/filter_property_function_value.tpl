        public static Func<{{model}}, bool> Filter()
        {
            Func<{{model}}, bool> result = (model) => {
                var res = true;

{{filter}}
                return res;
            }

            return result;
        }