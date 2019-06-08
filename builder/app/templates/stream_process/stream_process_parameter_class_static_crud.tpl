        public static {{model}}Parameter {{method}}({{parameters}}) 
        {
            
            var result = new {{model}}Parameter();
            
            result.Stream = StreamTypes.{{model}};

            {{parameters_property}}

            return result;
        }