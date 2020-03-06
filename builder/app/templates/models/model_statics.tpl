        public static {{model}} Create()
        {
            return new {{model}} { };
        }

        public static {{model}} Strip({{model}} model)
        {
            var new_model = Create();

            new_model.Id = model?.Id;

            return new_model;
        }

        public static {{model}} Merge({{model}} a, {{model}} b)
        {
            var model = Create();

{{property_set_merge}}


            return model;
        }

        public static IList<{{model}}> Merge(IList<{{model}}> a, IList<{{model}}> b)
        {
           var result = new List<{{model}}>();
           if(a != null)
           {
              foreach(var a_i in a) {
                result.Add(a_i);
              }
           }
           if(b != null)
           {
              foreach(var b_i in b)
              {
                var match = result.FirstOrDefault(x=> x.Id == b_i.Id);
                if(match != null)
                {
                    var merged_item = Merge(match, b_i);
                    result = result.Where(x=> x.Id != b_i.Id).ToList();
                    result.Add(merged_item);
                }
                else {
                  result.Add(b_i);
                }
              }
           }
           return result;
        }
